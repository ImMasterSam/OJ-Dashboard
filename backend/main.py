import schedule
from time import sleep
from sys import exit
import os
import sys
import logging
import logging.handlers

from scraper.getSubmissions import getSubs
from scraper.getCode import getCode
from services.upload_to_supabase import sync_all_to_supabase

STARTUP_DELAY = 0           # (Seconds)
CHECK_INTERVAL = 12         # (Minutes)
CODE_CHECK_INTERVAL = 24    # (Hours) - 程式碼補抓的間隔
LOG_INTERVAL = 1            # (Hours)
LOGGER_BACKUP = 10000
log2console = False

Running = True

if __name__ == "__main__":

    logging.basicConfig(level = logging.INFO,
                        format = '[%(levelname)s] %(asctime)s: %(message)s',
                        datefmt = '%Y/%m/%d %H:%M:%S',
                        filename = 'logs/Dashboard.log')
    if log2console:
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))
    logging.handlers.TimedRotatingFileHandler(filename = "logs/Dashboard.log", 
                                              when = 'H',
                                              interval = LOG_INTERVAL,
                                              backupCount = LOGGER_BACKUP)

    # 確定 settings.json 已經存在且格式正確
    try:
        from core.config import load_config
        load_config()
    except Exception as e:
        logging.critical(f'Config error: {e}')
        exit(1)

    # 延長啟動時間
    sleep(STARTUP_DELAY)

    def get_subs_and_sync():
        getSubs()
        sync_all_to_supabase()

    # 初次執行爬蟲（metadata + code backfill）
    get_subs_and_sync()
    getCode()

    # 每 {CHECK_INTERVAL} 分鐘抓取 submission metadata
    schedule.every(CHECK_INTERVAL).hours.do(get_subs_and_sync)

    # 每 {CODE_CHECK_INTERVAL} 小時補抓程式碼
    schedule.every(CODE_CHECK_INTERVAL).hours.do(getCode)

    while Running:
        sleep(1)
        schedule.run_pending()
