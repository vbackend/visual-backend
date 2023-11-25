import uvicorn
import sys

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        reload=True,
        port=(int(sys.argv[1]) if len(sys.argv) > 1 else 8000),
    )
