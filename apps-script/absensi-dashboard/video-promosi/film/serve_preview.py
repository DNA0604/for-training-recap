"""Local preview server with HTTP byte ranges for seeking AAC/MP4 media.

Run: python film/serve_preview.py --port 8000
Open http://127.0.0.1:8000/film/player.html . No external service required.
"""
import argparse
import functools
import http.server
import re
from pathlib import Path


class MediaHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

    def end_headers(self):
        self.send_header('Accept-Ranges','bytes')
        super().end_headers()

    def send_head(self):
        self.byte_range=None
        path=Path(self.translate_path(self.path))
        header=self.headers.get('Range')
        if not header or not path.is_file():return super().send_head()
        size=path.stat().st_size
        match=re.fullmatch(r'bytes=(\d*)-(\d*)',header)
        if not match or not any(match.groups()):return self.invalid_range(size)
        lo,hi=match.groups()
        if lo:
            start=int(lo);end=min(int(hi),size-1) if hi else size-1
        else:
            start=max(0,size-int(hi));end=size-1
        if start>end or start>=size:return self.invalid_range(size)
        file=path.open('rb');file.seek(start)
        self.byte_range=(start,end)
        self.send_response(206)
        self.send_header('Content-Type',self.guess_type(str(path)))
        self.send_header('Content-Length',str(end-start+1))
        self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.end_headers()
        return file

    def invalid_range(self,size):
        self.send_response(416)
        self.send_header('Content-Range',f'bytes */{size}')
        self.send_header('Content-Length','0')
        self.end_headers()
        return None

    def copyfile(self,source,outputfile):
        try:
            if self.byte_range is None:return super().copyfile(source,outputfile)
            left=self.byte_range[1]-self.byte_range[0]+1
            while left:
                data=source.read(min(left,65536))
                if not data:break
                outputfile.write(data);left-=len(data)
        except (BrokenPipeError,ConnectionResetError):
            pass


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8000)
    args=parser.parse_args()
    root=Path(__file__).resolve().parent.parent
    handler=functools.partial(MediaHandler,directory=str(root))
    print(f'Pratinjau lokal: http://127.0.0.1:{args.port}/film/player.html',flush=True)
    http.server.ThreadingHTTPServer(('127.0.0.1',args.port),handler).serve_forever()
