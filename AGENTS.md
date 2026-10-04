# ASHBORN — agent rules

You execute written packets. You do not design.

1. Do exactly what the packet says, in the order written. Nothing more.
2. Read only the files the packet names. Do not scan or explore the repo.
3. Copy content files verbatim. Do not rewrite, improve, or rename.
4. Do not propose alternatives. Do not ask which option to choose.
5. Do not add features, dependencies, or refactors not in the packet.
6. If a step is unclear, a file is missing, a command fails, or the
   result differs from "expected": STOP. Report the exact error. Do nothing else.
7. Never put secrets (keys, passwords) in any file.
8. When finished, reply only: "DONE <packet id>" and the result of the
   packet's done check. Maximum 5 lines. No summary, no explanation.
9. To find code, open CODE_MAP.md first. Then search the project for the tag it names, followed by :START (example: AB:LOGIN.BG:START). Edit only between that START line and its END line. Never scan the repo.
10. Never invent, rename or delete a tag. Tags are written in packets. After any change to code, run `node scripts/check-tags.mjs`. It must print TAGS OK.
11. Before you change tagged code, open CONNECTIONS.md and search it for that tag. Change a linked place only if the packet names it. After any change to code, run `node scripts/check-tags.mjs`: it must print TAGS OK and CONNECTIONS OK. If it prints CONNECTIONS FAILED, stop and report the full output. Do not fix it.