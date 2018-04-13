const { parse } = require('babylon')

/**
 * Process source code in the form of a string
 * @param sourceCodeText - Just a string representing a page of code
 * @param walkCallback - This gets called at each Node of the AST. See
 *                       processNode() below for parameters.
 * @param options - Additional custom options for Babylon
 * @return - Nothing
 */
const indexCode = (sourceCodeText, walkCallback, options) => {
  if (typeof sourceCodeText !== 'string') {
    return null
  }
  const parseOptions = Object.assign(
    {
      allowHashBang: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      ecmaVersion: 6,
      features: {},
      locations: true,
      plugins: ['jsx', 'flow'],
      sourceType: 'module',
      strictMode: false,
    },
    options || {},
  )

  try {
    const ast = parse(sourceCodeText, parseOptions)
    walkBabylonAst(ast, null, walkCallback)
  } catch (e) {
    console.log('PARSE ERROR')
    console.log(e)
    throw e
  }
}

/**
 * Extract information from the Babylon data structure for a Node and call the
 * processing callback.
 * @param node - A Babylon Node
 * @param parent - The parent Babylon Node
 * @param walkCallback - Callback for everynode
 * @param scopeLevel - Number, the level in the AST in terms of scope
 * @return - Nothing
 */
export const walkBabylonAst = (node, parent, walkCallback, scopeLevel = 0) => {
  let thisScopeLevel = scopeLevel
  if (thisScopeLevel > 1) {
    return
  }

  // We go down in scope levels when we encounter those (think function
  // declaration)
  if (
    node.type === 'VariableDeclaration' ||
    node.type === 'ExportDefaultDeclaration'
  ) {
    thisScopeLevel += 1
  }

  // NOTE: Potential feature --
  // If we're in a control block of an if statement, we skip
  // if (node.type === "VariableDeclaration" && node.parent &&  node.parent.type === "ForStatement") {
  //   console.log("skipping for-statement's declaration")
  //   return
  // }

  // The schema of the objects we receive from Babylon is changing depending on
  // the type of Node, so we grab all the keys and we do heuristics
  const keys = Object.keys(node)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key === 'parent') {
      continue
    }

    const value = node[key]

    // When we're hitting keys like "body", "specifiers", "leadingComments"
    if (Array.isArray(value)) {
      for (let j = 0; j < value.length; j++) {
        const childNode = value[j]
        if (childNode && typeof childNode.type === 'string') {
          childNode.parent = node
          walkBabylonAst(childNode, node, walkCallback, thisScopeLevel)
        }
      }
    } else if (value && typeof value.type === 'string') {
      const childNode = value
      childNode.parent = node
      walkBabylonAst(childNode, node, walkCallback, thisScopeLevel)
    }
  }
  walkCallback(node)
}

export const processNode = (data, filename) => nodeData => {
  const babelTypesToCtagsTypes = {
    ClassDeclaration: 'c',
    ExportDefaultDeclaration: 'e',
    FunctionDeclaration: 'f',
    ImportDefaultSpecifier: 'i',
    ImportSpecifier: 'i',
    MethodDefinition: 'f',
    TypeAlias: 'v',
    VariableDeclarator: 'v',
  }

  const type = babelTypesToCtagsTypes[nodeData.type]
  if (!type) {
    return undefined
  }

  let identifierKey
  if (nodeData.id) {
    identifierKey = 'id'
  } else {
    if (nodeData.key) {
      identifierKey = 'key'
    } else {
      identifierKey = 'local'
    }
  }

  // When we encounter a default export, we name it with the name of the file
  // NOTE: When jumping to a symbol, don't forget to default to the start of the
  // line if the symbol isn't there, because for a default export it might not
  // be there!
  let name
  if (nodeData.type === 'ExportDefaultDeclaration') {
    name = filename
      .split('/')
      .pop()
      .split('.')[0]
  } else {
    name = nodeData[identifierKey].name
  }
  if (!name) {
    return null
  }
  // This is an Array
  const tagData = [name, filename, `${nodeData.loc.start.line};"`, type]

  if (tagData) {
    data.push(tagData)
  }

  return undefined
}

export const generateTags = (code, filename) => {
  const data = []

  indexCode(code, processNode(data, filename))

  return data
}
