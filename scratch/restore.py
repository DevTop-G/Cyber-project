import os

file_path = r'c:\Users\suraj\Downloads\TOPPER G\viie-business-it-project\ai_agent\agents\agent2_content.py'

with open(file_path, 'r', encoding='utf-8') as f:
    body = f.read()

header = """from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModel, pipeline
import torch
import torch.nn.functional as F
import os
import pickle
import re

class ContentAnalysisAgent:
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(header + body)
