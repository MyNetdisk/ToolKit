import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

json1_path = os.path.join(script_dir,'json1.json')
json2_path = os.path.join(script_dir,'json2.json')

# Load the fisrt JSON file
with open(json1_path,'r',encoding='utf-8') as file1:
    json1_data = json.load(file1)

# Load the second JSON file
with open(json2_path,'r',encoding='utf-8') as file2:
    json2_data = json.load(file2)

def update_json(json1,json2):
    """Define a function to recursively update JSON data

    Args:
        json1 (_type_): json file
        json2 (_type_): json file
    """
    if isinstance(json1,dict) and isinstance(json2,dict):
        for key, value in json1.items():
            if key in json2:
                json1[key] = json2[key]
            else:
                update_json(value,json2)
    elif isinstance(json1,list) and isinstance(json2,list):
        for i in range(len(json1)):
            update_json(json1[i],json2[i])
    elif isinstance(json1,dict) and isinstance(json2, list):
        for key, value in json1.items():
            if isinstance(value,dict):
                update_json(value,json2)
            else:
                for item in json2:
                    if value == item['中文']:
                        json1[key] = item['葡文']
                    
# Update the first JSON data using the second JSON
update_json(json1_data,json2_data)

update_path = os.path.join(script_dir, 'update.json')

# Wirte the update JSON data back to a new file
with open(update_path, 'w', encoding='utf-8') as update_file:
    json.dump(json1_data,update_file,ensure_ascii=False,indent=4)

print("Replacement completed and saved as 'update.json'")