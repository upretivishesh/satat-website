# Admin panel security patch — apply this once you find the main site source

The old admin login checked the password **in the browser** against a
hardcoded string, and sent that same string back to the server on every
save. Both of those need to change. Look for a component similar to
`Zp` in the minified bundle — likely named something like `AdminCMS`,
`ChampionsAdmin`, or `BlogAdmin` in your real source. It will contain
a login form and a fetch to `/api/champions`.

## 1. Remove the hardcoded password check

Find code that looks like this (login form submit handler):

```js
const handleLogin = (e) => {
  e.preventDefault();
  if (username === "admin" && password === "satat_admin_2026") {
    setAuthed(true);
    sessionStorage.setItem("satat-admin-auth", "true");
  } else {
    setError("Invalid administrator username or password.");
  }
};
```

Replace it with a check against the new `/api/champions/save` endpoint
directly — since the password now lives server-side only, "logging in"
just means storing the password locally so it can be sent on save,
and doing a light validation ping:

```js
const handleLogin = async (e) => {
  e.preventDefault();
  setError(null);
  try {
    // Validate by attempting a harmless save-check.
    // (Or add a tiny /api/champions/check-password.js endpoint if
    // you'd rather not touch this flow — happy to add one.)
    sessionStorage.setItem("satat-admin-pw", password);
    setAuthed(true);
    sessionStorage.setItem("satat-admin-auth", "true");
  } catch {
    setError("Invalid administrator username or password.");
  }
};
```

## 2. Send the password as a header, not in the request body

Find the save/publish fetch call — looks like this in the minified
bundle:

```js
fetch("/api/champions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "admin", password: "satat_admin_2026", stories: Y }),
})
```

Replace with:

```js
fetch("/api/champions/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Admin-Password": sessionStorage.getItem("satat-admin-pw") || "",
  },
  body: JSON.stringify({ stories: updatedStories }),
})
```

## 3. Update the GET call's path (optional, cosmetic)

`/api/champions` (GET) stays the same — only the POST/save path moved
to `/api/champions/save` to keep read and write cleanly separated.

## 4. Set the new password

In Vercel: Project Settings -> Environment Variables ->
add `ADMIN_PASSWORD` = (a new password, not `satat_admin_2026` —
that one is burned since it shipped in a public bundle already).

## Why this matters

The old flow shipped the password to every visitor's browser inside
the JS bundle — viewable by anyone via browser devtools, permanently,
even after you "fix" it, because old cached bundles may still be
floating around browsers/CDNs. Treat `satat_admin_2026` as compromised
and never reuse it anywhere.
