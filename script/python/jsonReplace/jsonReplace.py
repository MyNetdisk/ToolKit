import json
import os

def load_json(file_path):
    """Load a JSON file and return its contents.

    Args:
        file_path (_type_): _description_

    Returns:
        _type_: _description_
    """
    with open(file_path,'r',encoding='utf-8') as file:
        return json.load(file)

def update_json_fields(json1,json2):
    """Update JSON1 fields using matching values from JSON2 fields.

    Args:
        json1 (_type_): _description_
        json2 (_type_): _description_
    """
    if isinstance(json1,dict) and isinstance(json2,list):
        for key,value in json1.items():
            matching_item = next((item for item in json2 if item.get('中文') == value), None)
            if matching_item:
                json1[key] = matching_item.get('葡文')
            # 用于处理 JSON 数据中嵌套的字典情况
            if isinstance(value,dict):
                update_json_fields(value,json2)
    # TODO:处理其他情况（如 json1 和 json2 都是列表）...

def save_json(file_path,data):
    """Save data as JSON to a file.

    Args:
        file_path (_type_): _description_
        data (_type_): _description_
    """
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data,file,ensure_ascii=False,indent=4)

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json1_path = os.path.join(script_dir,'json1.json')
    json2_path = os.path.join(script_dir,'json2.json')
    update_path = os.path.join(script_dir, 'update.json')

    json1_data = load_json(json1_path)
    json2_data = load_json(json2_path)

    update_json_fields(json1_data,json2_data)

    save_json(update_path,json1_data)

    print("Replacement completed and saved as 'update.json'")

if __name__ == "__main__":
    main()