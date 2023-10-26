# 使用说明 - 获取 Git 提交记录

这个脚本用于获取特定作者的 Git 提交记录并将其保存为 word 文件。

## 使用前提

- 你需要安装 Python，并确保已经安装了必要的第三方库 `docx`。

    ```
    pip install python-docx
    ```
    或者执行以下命令
    ```
    pip install -r requirements.txt
    ```

- 你需要安装 Git，并在目标仓库中运行过初始化。

## 使用方法

1. 下载脚本文件 `gitDailyWorkReport.py` 到你的计算机。

2. 打开命令提示符或终端，并导航到包含脚本文件的目录。

3. 运行脚本，并提供以下参数：

    - `author_name`：要获取提交记录的作者名字。
    - `repo_path`（可选）：仓库的路径。如果不提供路径，将使用当前目录的仓库。

    示例：

    ```bash
    python gitDailyWorkReport.py "John Doe" --repo_path D:\Project\biztable-fe\databook-web
    ```

    这将获取 "John Doe" 的提交记录，并将其保存为 `daily_work_report.docx` 文件。

4. 执行脚本后，你将在指定的输出文件中看到 Git 提交记录以 word 格式。

5. 生成的Word文档将保存在与脚本相同的目录中，并命名为 daily_work_report.docx。你可以使用Word处理软件打开该文档以查看工作报告。

## 注意事项

- 确保你提供的仓库路径是正确的，并且在指定的仓库中已运行初始化。

- 如果提交记录包含非UTF-8编码的字符，请根据需要在脚本中进行编码处理。

- 如果遇到任何问题或错误，请查看错误消息以获取帮助。

- 请根据自己的需要修改脚本中的参数和输出文件路径。

希望这份使用说明有助于你使用脚本来获取 Git 提交记录并将其保存为 word 文件。如果有任何疑问或需要进一步的帮助，请随时联系。
