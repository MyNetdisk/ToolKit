import csv
import datetime
import os
from datetime import timedelta

from git import Commit, Repo

# 配置区

# 仓库目录（.git目录的父目录）
respDir = "D:\Project\Script"
# 提交作者
author = ""
# 提交起始日期,格式: 2022-12-30,都留空则以本周一零点和周日24点作为起始日期.
# 开始日期(以0点计算)
startDate = "2022-12-30"
# 结束日期(以24点计算)
endDate = "2023-09-17"
# 时间的时区
timeZone = datetime.timezone(datetime.timedelta(hours=8), '中国标准时间')
# ================


def conventTzDate(date: str) -> datetime:
    return datetime.datetime.strptime(
        date, '%Y-%m-%d').replace(tzinfo=timeZone)


if (startDate != ""):
    startDate = conventTzDate(startDate)
if (endDate != ""):
    endDate = (conventTzDate(endDate) +
               datetime.timedelta(hours=23, minutes=59, seconds=59))
if (startDate == "" and endDate == ""):
    now = datetime.datetime.now().replace(tzinfo=timeZone)
    startDate = now - datetime.timedelta(days=now.weekday(), hours=now.hour,
                                         minutes=now.minute, seconds=now.second, microseconds=now.microsecond)
    endDate = now + datetime.timedelta(days=6 - now.weekday(
    ), hours=23 - now.hour, minutes=59 - now.minute, seconds=59 - now.second)


def getFilterCommits(branchName: str) -> list[Commit]:
    revListArgs = {"author": author}
    if (startDate != ""):
        revListArgs["after"] = startDate.strftime("%Y-%m-%d %H:%M:%S%z")
    if (endDate != ""):
        revListArgs["before"] = endDate.strftime("%Y-%m-%d %H:%M:%S%z")
    return list(repo.iter_commits(branchName, **revListArgs))


repo = Repo.init(path=respDir)
respName = os.path.basename(respDir)
nowBranchName = repo.active_branch.name
nameCommitMap = {}


def putToMap(branchName: str):
    list = getFilterCommits(branchName)
    if len(list) != 0:
        nameCommitMap[branchName] = list


putToMap(nowBranchName)

for branch in repo.branches:
    if (branch.name != nowBranchName):
        putToMap(branch.name)

topTitle = respName
if startDate != "":
    topTitle += " "
    topTitle += startDate.strftime("%Y-%m-%d")
    topTitle += "起"

if endDate != "":
    topTitle += " "
    topTitle += endDate.strftime("%Y-%m-%d")
    topTitle += "止"

topTitle += " "
topTitle += author
topTitle += " 的本地所有分支提交记录汇总"


def outputMap(source: dict, layer: int, writer):
    for key, value in source.items():
        keylist = [key]
        for i in range(0, layer):
            keylist.insert(0, "")
        writer.writerow(keylist)
        if isinstance(value, dict):
            outputMap(value, layer+1, writer)
        elif isinstance(value, list):
            headerList = ["mes", "authored date", "committed date", "hexsha"]
            for i in range(0, layer+1):
                headerList.insert(0, "")
            writer.writerow(headerList)
            for c in value:
                c: Commit
                valueList = []
                valueList.append(c.message)
                valueList.append(c.authored_datetime)
                valueList.append(c.committed_datetime)
                valueList.append(c.hexsha)
                for i in range(0, layer+1):
                    valueList.insert(0, "")
                writer.writerow(valueList)


outputdir = os.path.split(os.path.realpath(__file__))[0]
outputFileName = os.path.join(outputdir, topTitle+'.csv')

with open(outputFileName, 'w', newline='') as csvfile:
    writer = csv.writer(csvfile, dialect='excel')
    outputMap({topTitle: nameCommitMap}, 0, writer)
    print("结果已输出到文件："+outputFileName)
repo.close

