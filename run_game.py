#!/usr/bin/env python3
# -*- coding: utf-8 -*-"""
""" Скрипт для запуска игры Танчики
Запускает локальный сервер и открывает HTML-файл в браузере
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path
import json
from datetime import datetime

LOG_FILE = 'log.txt'

class LoggingRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                log_entry = json.loads(post_data.decode('utf-8'))
                
                with open(LOG_FILE, 'a', encoding='utf-8') as f:
                    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    log_message = log_entry.get('message', '')
                    log_type = log_entry.get('type', 'ERROR')
                    f.write(f"[{timestamp}] [{log_type.upper()}] {log_message}\n")
                    
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok'}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'error': str(e)}).encode())
        else:
            super().do_GET()

def find_free_port(start_port=8000, max_tries=100):
    """Ищет свободный TCP порт, начиная с указанного."""
    print(f"Поиск свободного порта, начиная с {start_port}...")
    for port in range(start_port, start_port + max_tries):
        try:
            # Пытаемся создать сервер на порту, чтобы проверить, свободен ли он
            with socketserver.TCPServer(('', port), LoggingRequestHandler):
                return port
        except OSError:
            continue # Порт занят, пробуем следующий
    return None


def main():
    # Получаем путь к текущей директории
    current_dir = Path(__file__).parent.absolute()

    # Проверяем наличие index.html
    index_file = current_dir / "index.html"
    if not index_file.exists():
        print("Ошибка: Файл index.html не найден!")
        print(f"Ожидаемый путь: {index_file}")
        sys.exit(1)

    # Настройки сервера
    PORT = find_free_port()
    if PORT is None:
        print("Ошибка: Не удалось найти свободный порт в диапазоне 8000-8100.")
        print("Пожалуйста, закройте другие программы и попробуйте снова.")
        sys.exit(1)

    DIRECTORY = str(current_dir)

    # Меняем рабочую директорию
    os.chdir(DIRECTORY)

    # Создаем HTTP сервер
    Handler = LoggingRequestHandler
    # Отключаем логирование каждого запроса в консоль для чистоты вывода
    Handler.log_message = lambda *args: None

    try:
        with socketserver.TCPServer(('', PORT), Handler) as httpd:
            print("Запуск игры Танчики...")
            print(f"Директория: {DIRECTORY}")
            print(f"Сервер успешно запущен на порту {PORT}")
            print(f"Открываю: http://localhost:{PORT}")
            print("Открываю в браузере...")
            print(f"Логи будут записываться в файл: {LOG_FILE}")
            print("\nДля остановки сервера нажмите Ctrl+C")
            print("=" * 50)

            # Открываем браузер
            webbrowser.open(f"http://localhost:{PORT}")
            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n\nСервер остановлен")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"Ошибка: Порт {PORT} уже занят!")
            print("Попробуйте остановить программу, использующую этот порт, или перезапустите скрипт.")
        else:
            print(f"Неожиданная ошибка: {e}")
    except Exception as e:
        print(f"Неожиданная ошибка: {e}")

if __name__ == "__main__":
    main()