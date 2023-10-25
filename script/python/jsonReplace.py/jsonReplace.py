import json

# Load the fisrt JSON file
with open('json1.json','r') as file1:
    json1_data = json.load(file1)

# Load the second JSON file
with open('json2.json','r') as file2:
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

# Update the first JSON data using the second JSON
update_json(json1_data,json2_data)

# Wirte the update JSON data back to a new file
with open('update.json', 'w') as update_file:
    json.dump(json1_data,update_file,indent=4)

print("Replacement completed and saved as 'update.json'")