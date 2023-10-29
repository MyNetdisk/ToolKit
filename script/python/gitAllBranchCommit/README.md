以下是用于描述如何使用该脚本的Markdown格式的使用说明文档。您可以将此文档保存为`.md`文件以供参考或共享给其他用户。

# 使用说明 - 本地Git分支提交记录汇总工具

## 概述

该Python脚本是一个命令行工具，用于生成本地Git仓库的分支提交记录汇总。您可以使用它来获取特定作者在指定日期范围内的提交历史摘要。

## 先决条件

在运行此脚本之前，您需要确保以下内容：

- Python：确保您的计算机上安装了Python。您可以从[官方网站](https://www.python.org/downloads/)下载并安装最新版本的Python。

- Git：您需要安装并配置Git，并在命令行中可用Git命令。可以从[Git官方网站](https://git-scm.com/downloads)下载Git。

- Python库：确保安装了以下Python库，您可以使用pip进行安装：

    ```bash
    pip install gitpython
    ```

## 安装

1. 下载脚本文件：首先，从GitHub或其他来源下载脚本文件（通常以`.py`扩展名保存）。

2. 存储脚本：将脚本文件保存到您选择的目录中。您可以选择将脚本保存到任何方便的位置。

## 使用方法

打开终端（命令行提示符）并执行以下命令以使用脚本：

```bash
python script_name.py --author AUTHOR_NAME --start_date START_DATE --end_date END_DATE
```

其中：
- `script_name.py` 是脚本的文件名。
- `AUTHOR_NAME` 是您要查找提交记录的作者的姓名（必填参数）。
- `START_DATE`（可选参数）是开始日期（格式为YYYY-MM-DD，默认为“2022-12-30”）。
- `END_DATE`（可选参数）是结束日期（格式为YYYY-MM-DD，默认为当前日期）。

**示例用法**：

```bash
python gitAllBranchCommit.py --author JohnDoe --start_date 2023-01-01 --end_date 2023-10-29
```

执行脚本后，它将生成一个CSV文件，其中包含了指定作者在指定日期范围内的提交历史摘要。

## 输出文件

脚本将生成一个CSV文件，文件名会显示为`作者名 的本地所有分支提交记录汇总.csv`，该文件将包括分支名称和相关的提交详情。

## 选项

### `--repo_dir`

- 可选参数
- 用法：`--repo_dir PATH_TO_REPO`
- 说明：指定Git仓库的路径。如果未提供此参数，脚本将在当前工作目录中查找Git仓库。

## 注意事项

- 请确保您在运行脚本之前已经安装所需的Python库（`gitpython`）。
- 脚本将默认使用“中国标准时间”（CST）作为时区，并使用UTC+8时区偏移。
- 请提供正确的作者姓名，以便脚本正确筛选提交历史。

## 示例

以下是一个示例用法的命令：

```bash
python gitAllBranchCommit.py --author JohnDoe --start_date 2023-01-01 --end_date 2023-10-29
```

## 帮助

如果您需要有关脚本的更多帮助或有任何疑问，请在终端中执行以下命令以查看脚本帮助信息：

```bash
python gitAllBranchCommit.py --help
```

这将显示脚本的选项和使用说明。

## 结语

此脚本可帮助您轻松生成本地Git仓库的提交历史摘要，以了解特定作者在指定日期范围内的工作。希望它对您有所帮助！