# Network Port Checker

A Flask web app for checking TCP ports on a target host. It can check a
single port or scan the common ports 21, 22, 25, 53, 80, and 443.

## Run locally

```bash
python -m pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000`.

## Deploy to Vercel

Import this repository into Vercel and keep the project root directory set to
the repository root. Vercel detects the Flask app in `app.py`. The HTML
template is in `frontend/`; CSS and JavaScript are in `public/` and are served
by Vercel at `/style.css` and `/script.js`.

Use port checks only against systems you own or are authorized to test.
