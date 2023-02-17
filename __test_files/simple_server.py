from flask import Flask, render_template, send_from_directory

app = Flask(__name__, template_folder=".")

@app.route('/')
def send_index():
    return render_template(
        'index.html',
        school_name = "Binom-School Tanym, 38-улица 9/5, Астана"
    )

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

app.run(debug=True)
