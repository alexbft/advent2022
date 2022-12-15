import re


class File:
    def __init__(self, name, size):
        self.name = name
        self.size = size


class Dir:
    def __init__(self, name, parent=None):
        self.name = name
        self.parent = parent
        self.dirs = []
        self.files = []
        self.total_size = 0

    def add_dir(self, dir_name):
        dir = Dir(dir_name, self)
        self.dirs.append(dir)

    def add_file(self, file_name, file_size):
        file = File(file_name, file_size)
        self.files.append(file)
        self.add_size(file.size)

    def add_size(self, size):
        self.total_size += size
        if self.parent is not None:
            self.parent.add_size(size)

    def find_dir(self, dir_name):
        return next(dir for dir in self.dirs if dir.name == dir_name)


def eval_cd(dir_name):
    global cur

    if dir_name == '/':
        cur = root
    elif dir_name == '..':
        cur = cur.parent
    else:
        cur = cur.find_dir(dir_name)


def get_all_dirs(root):
    def walk(cur, acc):
        acc.append(cur)
        for sub_dir in cur.dirs:
            walk(sub_dir, acc)
    result = []
    walk(root, result)
    return result


root = Dir('/')
cur = root
with open("7.txt") as finput:
    for line in finput:
        m = re.match(r'\$ ls', line)
        if m != None:
            continue
        m = re.match(r'\$ cd (\S+)', line)
        if m != None:
            eval_cd(m.group(1))
            continue
        m = re.match(r'dir (\S+)', line)
        if m != None:
            cur.add_dir(m.group(1))
            continue
        m = re.match(r'(\d+) (\S+)', line)
        if m != None:
            cur.add_file(m.group(2), int(m.group(1)))
            continue
        raise 'Unknown cmd: ' + line
disk_size = 70000000
free_space = disk_size - root.total_size
req_size = 30000000 - free_space
min_dir = None
all_dirs = get_all_dirs(root)
for dir in all_dirs:
    if dir.total_size >= req_size and (min_dir is None or dir.total_size < min_dir.total_size):
        min_dir = dir
print(min_dir.name, min_dir.total_size)
