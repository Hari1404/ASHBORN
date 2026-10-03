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