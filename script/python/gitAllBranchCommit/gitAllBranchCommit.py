import csv
import datetime
import os
from git import Commit, Repo
import argparse
import calendar


def convert_to_datetime(date_string, time_zone):
    return datetime.datetime.strptime(date_string, '%Y-%m-%d').replace(tzinfo=time_zone)

def get_time_range(start_date, end_date, time_zone):
    if start_date:
        start_date = convert_to_datetime(start_date, time_zone)
    if end_date:
        end_date = convert_to_datetime(end_date, time_zone) + datetime.timedelta(hours=23, minutes=59, seconds=59)
    return start_date, end_date

def get_commits(repo, author, start_date, end_date):
    commits = list(repo.iter_commits(author=author, after=start_date, before=end_date))
    return commits

def output_csv(data):
    output_dir = os.path.dirname(os.path.realpath(__file__))
    top_title = f"{author} 的本地所有分支提交记录汇总"
    
    with open(os.path.join(output_dir, f"{top_title}.csv"), 'w', newline='') as csvfile:
        writer = csv.writer(csvfile, dialect='excel')
        write_data(writer, {top_title: data})
        print("结果已输出到文件：" + top_title + ".csv")

def write_data(writer, data, level=0):
    for key, value in data.items():
        key_list = [''] * level + [key]
        writer.writerow(key_list)
        if isinstance(value, dict):
            write_data(writer, value, level + 1)
        elif isinstance(value, list):
            header_list = [''] * (level + 1) + ["mes", "authored date", "committed date", "hexsha"]
            writer.writerow(header_list)
            for commit in value:
                writer.writerow([''] * (level + 2) + [commit.message, commit.authored_datetime, commit.committed_datetime, commit.hexsha])

def main(repo_dir=None, author=None, start_date="2022-12-30", end_date="2023-10-29" ):
    if author is None:
        raise ValueError("Author is a required parameter.")
    if repo_dir:
        # If the repository path is provided, switch to that directory
        repo_dir = os.path.normpath(repo_dir)  # Normalize the path to adapt to the current OS's separators
        os.chdir(repo_dir)
    else:
        # If repo_dir is not provided, use the current working directory
        repo_dir = os.getcwd()

    repo = Repo.init(path=repo_dir)
    time_zone = datetime.timezone(datetime.timedelta(hours=8), '中国标准时间')
    if start_date is None or end_date is None:
        now = datetime.datetime.now().replace(tzinfo=time_zone)
        year = now.year
        month = now.month
        
        if start_date is None:
            start_date = datetime.datetime(year, month, 1, tzinfo=time_zone)
        
        if end_date is None:
            last_day = calendar.monthrange(year, month)[1]
            end_date = datetime.datetime(year, month, last_day, 23, 59, 59, tzinfo=time_zone)
    
    print('start_date',start_date)
    print('end_date',end_date)
    
    name_commit_map = {}

    for branch in repo.branches:
        commits = get_commits(repo, author, start_date, end_date)
        if commits:
            name_commit_map[branch.name] = commits

    output_csv(name_commit_map)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate local branch commit summary")
    parser.add_argument("--repo_dir", type=str, help="Path to the Git repository")
    parser.add_argument("--author", type=str, required=True, help="Author's name (required)")
    parser.add_argument("--start_date", type=str, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end_date", type=str, help="End date (YYYY-MM-DD)")
    args = parser.parse_args()

    # Configuration
    repo_dir = args.repo_dir
    author = args.author
    start_date = args.start_date
    end_date = args.end_date

    main(repo_dir, author, start_date, end_date)
