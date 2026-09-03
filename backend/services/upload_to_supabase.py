import json
from typing import List
from datetime import datetime
from supabase import create_client, Client
from scraper.Crawler import Submission

def load_supabase_config() -> dict:
    """從 settings.json 讀取 Supabase 設定"""
    try:
        from core.config import load_config
        config = load_config()
        return config.get("Supabase", {})
    except FileNotFoundError:
        print("錯誤：找不到 settings.json 檔案。")
        return {}
    except json.JSONDecodeError:
        print("錯誤：settings.json 格式無效。")
        return {}

def init_supabase_client(config: dict) -> Client:
    """初始化 Supabase 客戶端"""
    url: str = config.get("Url")
    key: str = config.get("Key")
    
    if not url or not key or url == "YOUR_SUPABASE_URL":
        raise ValueError("必須在 settings.json 中提供 Supabase 的 Url 和 Key")
        
    return create_client(url, key)

def sync_all_to_supabase():
    """整合讀取設定與上傳資料的完整流程"""
    supabase_config = load_supabase_config()
    if not supabase_config:
        print("未載入 Supabase 設定，跳過上傳。")
        return

    try:
        supabase_client = init_supabase_client(supabase_config)
        from services.submission_store import SubmissionStore
        store = SubmissionStore()
        
        print("正在載入資料準備上傳...")
        submissions_data = store.load()
        if not submissions_data:
            print("沒有資料可供上傳。")
            return
            
        print(f"成功讀取 {len(submissions_data)} 筆提交紀錄。開始上傳至 Supabase...")
        store.sync_to_cloud(supabase_client, submissions_data)
        print("Supabase 同步完成！")
        
    except ValueError as e:
        print(f"設定錯誤: {e}")
        print("請確認已經在 settings.json 中填入正確的 Supabase 憑證。")
    except Exception as e:
        print(f"上傳過程中發生錯誤: {e}")

if __name__ == "__main__":
    sync_all_to_supabase()
