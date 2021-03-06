import re
import os
from subprocess import Popen, PIPE, STDOUT

import sublime, sublime_plugin


def get_cursor_position(view):
    return view.sel()[0].begin()

def move_cursor_to(view, pos):
    view.sel().clear()
    view.sel().add(sublime.Region(pos))

def make_selection(view, start, end):
    view.sel().clear()
    view.sel().add(sublime.Region(start, end))

def select_region(view, region):
    view.sel().clear()
    view.sel().add(region)

def move_forward_by_lines(view, num):
    for i in range(int(num)):
        view.run_command("move", {"by": "lines", "forward": True})

def move_by_lines(view, num):
    if num > 0:
        for i in range(int(num)):
            view.run_command("move", {"by": "lines", "forward": True})
    elif num < 0:
        for i in range(abs(int(num))):
            view.run_command("move", {"by": "lines", "forward": False})

def move_backward_by_characters(view, num):
    for i in range(int(num)):
        view.run_command("move", {"by": "characters", "forward": False})

def move_to_line(view, num):
    cursor_position = get_cursor_position(view)
    line_number = view.rowcol(view.line(cursor_position).begin())[0] + 1
    print('cursor_line:', line_number)
    line_diff = num - line_number
    print('line_diff:', line_diff)
    move_by_lines(view, line_diff)


class BabeltagsgenerateCommand(sublime_plugin.TextCommand):

    def __init__(self, *args, **kvargs):
        super(BabeltagsgenerateCommand, self).__init__(*args, **kvargs)

    def run(self, edit):
        s = sublime.load_settings('yowsettings.json')
        print('the settings:', s.get('foo'))

        package_path = os.path.dirname(os.path.realpath(__file__))
        tag_generator_path = os.path.join(package_path,
                                          'dist/main.js')
        w = sublime.active_window()
        project_directories = w.project_data()['folders']
        project_directory = project_directories[0]['path']
        current_file = w.active_view().file_name()

        # We only support JS files
        if current_file[-2:] != 'js':
            w.status_message("Not a Javascript file!")
            return

        # Build the command we want to shell out
        output_file = os.path.join(project_directory, '.tags')
        intput_file = current_file

        # TODO: Check if Node is installed, has the right version
        command = "node {} {} {}".format(
            tag_generator_path, intput_file, output_file)
        print('command being issued:', command)

        p = Popen(command, shell=True, stdin=PIPE, stdout=PIPE, stderr=STDOUT,
                  close_fds=True)
        output = p.stdout.read()
        print('success,', output)
        w.status_message("File successfully indexed!")


# class BabeltagsgotoCommand(sublime_plugin.TextCommand):



class BabeltagsjumpCommand(sublime_plugin.TextCommand):

    def __init__(self, *args, **kvargs):
        super(BabeltagsjumpCommand, self).__init__(*args, **kvargs)
        self.symbols_locations = []

    def on_done(self, the_one_that_changed):
        if the_one_that_changed == -1:
            return
        print("on_change:", the_one_that_changed)
        symbol = self.symbols_locations[the_one_that_changed][0]
        file_name = self.symbols_locations[the_one_that_changed][1]
        line_number = self.symbols_locations[the_one_that_changed][2]
        line_number = re.search("[0-9]+", line_number).group()
        w = sublime.active_window()
        v = w.open_file(file_name)

        def callback():
            move_to_line(v, int(line_number) - 1)

            # Select the symbol
            print("Trying to find:", symbol)
            r = v.find(symbol, get_cursor_position(v))
            select_region(v, r)

            v.show_at_center(get_cursor_position(v))

        sublime.set_timeout(callback, 10)

    def run(self, edit):
        w = sublime.active_window()

        project_folders = w.project_data()['folders']
        first_directory = project_folders[0]['path']
        print(first_directory)

        symbols_locations = ["No Symbols :("]

        # Look for a CTags file
        with open(first_directory + '/.tags') as ctags_file:
            ctags_data = ctags_file.read()
            self.symbols_locations = \
                [line.split('\t')[0:3] for line in ctags_data.split('\n')]

        symbol_list = [[item[0], item[1]] for item in self.symbols_locations if len(item)>1]
        w.show_quick_panel(symbol_list, self.on_done)


class PooflineCommand(sublime_plugin.TextCommand):

    def __init__(self, *args, **kvargs):
        super(PooflineCommand, self).__init__(*args, **kvargs)

    def run(self, edit):
        w = sublime.active_window()
        v = w.active_view()
        move_to_line(v, 20)

class BabeltagshyperCommand(sublime_plugin.TextCommand):

    def __init__(self, *args, **kvargs):
        super(BabeltagshyperCommand, self).__init__(*args, **kvargs)

    def run(self, edit):
        w = sublime.active_window()
        v = w.active_view()
        word_region = v.word(get_cursor_position(v))
        word = v.substr(word_region)
        print('word:', word)

        project_folders = w.project_data()['folders']
        project_directory = project_folders[0]['path']
        print(project_directory)

        # symbols_locations = ["No Symbols :("]

        # TODO: Take this out and factor
        def gotoWord(the_one_that_changed):
            symbol = self.symbols_locations[the_one_that_changed][0]
            file_name = self.symbols_locations[the_one_that_changed][1]
            line_number = self.symbols_locations[the_one_that_changed][2]
            line_number = re.search("[0-9]+", line_number).group()
            print('goto: symbol:',symbol,' line_number:', line_number)
            w = sublime.active_window()
            v = w.open_file(file_name)

            def callback():
                print('is loading?', v.is_loading())
                if v.is_loading():
                    sublime.set_timeout(callback, 20)

                move_to_line(v, int(line_number) - 1)

                # Select the symbol
                print("Trying to find:", symbol)
                r = v.find(symbol, get_cursor_position(v))
                select_region(v, r)

                v.show_at_center(get_cursor_position(v))
                # vec = v.text_to_layout(r.begin())
                # v.set_viewport_position(vec, False)

            sublime.set_timeout(callback, 20)
        # spam
        # Look for a CTags file
        with open(project_directory + '/.tags', 'r', encoding='utf8') as ctags_file:
            ctags_data = ctags_file.read()
            self.symbols_locations = [line.split('\t')[0:3] for line in ctags_data.split('\n')]

            # Look for word
            for (i, line) in enumerate(self.symbols_locations):
                if line[0] == word:
                    print('found the word')
                    gotoWord(i)
