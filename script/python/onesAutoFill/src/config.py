import os
import yaml

class Config:
    def __init__(self, config_path = 'config/.git_ones.yaml'):
        self.config = self.load_yaml(config_path)

    # 加载配置内容
    def load_yaml(self, path):
        with open(path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    def get_git_config(self):
        return self.config['git']

    def get_ones_config(self):
        return self.config['ones']

    def get_mapping_rules(self):
        return self.config.get('mapping_rules', {})

    def get_runtime_config(self):
        return self.config.get('runtime', {})
