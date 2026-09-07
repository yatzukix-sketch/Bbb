# PRIMORDIUM — The Book of the Circle
## Book I · A Challenge for the Decoder

> *“The circle has no end, yet it ends where it began.”*

You are given an encrypted manuscript. Your task is to **recover the three hidden
plaintext messages** and, if you reach far enough, **follow the trail that
continues beyond the pages**. Everything you need is on this page. Nothing is
missing, and nothing is a trick. A valid solution exists and is unique.

---

## 1 · THE ALPHABET

The manuscript is written in a runic alphabet of **26 runes**, one for each
letter A–Z. Every rune is bound to a **prime number**, in order:

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2 | 3 | 5 | 7 | 11 | 13 | 17 | 19 | 23 | 29 | 31 | 37 | 41 |

| N | O | P | Q | R | S | T | U | V | W | X | Y | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 43 | 47 | 53 | 59 | 61 | 67 | 71 | 73 | 79 | 83 | 89 | 97 | 101 |

(The runes have been transliterated to their letters below; you do not need the
images. The letter order IS the rune order.)

---

## 2 · THE THREE PAGES (ciphertext)

### PAGE I — THE MIRROR
```
KIRNLIWRFNGSVYLLPLUGSVXRIXOVYVORVEVMLGSRMTBLFZIVGLOWFMGROBLFSZEVGVHGVWRGBLFIHVOUGSVNRIILIIVEVIHVHZOOGSRMTHDSZGVMWHDSVIVRGYVTRMHRHZXRIXOVZMWGSVXRIXOVSZHMLHRWVHHKVZPGSVMZNVLUGSVELRXVGSZGHRMTHZOLMTGSVIRNZMWRGDROOFMOLXPGSVHVXLMWWLLI
```

### PAGE II — THE VOICE
```
CALWYRSXSWXHIVPWOVEYJJAUQEOQLJZYGWLJEGVHESECDIPWEAGWCQVAJHGVWXUHSPNOJJDKEVWHJJUNJWIRXXYJGVYGNEVNNNIZLSCVQVCAHLTAEXUQYIPLUOTKQSWHHVTNHNCRJXYJAASWPSXZZTXCJOTRHMLQGUXXWRBPJNNLVZDSJNJEUTHJBUTRYMLXSCHJNKHQRWCJYYHXJNHTCYKWSVSUEEZWGFJDYLWCQCRPWLDZQNZZISGHQCEVOTKQSRRUYDBJCXGTRWXBQTHVLJZFUSECIBQV
```

### PAGE III — THE END
```
UISJBNSTVJAJAEWUDEKNPWUYVFDPASGEWMBRREYKVNMRKBUSUQNJLMEBCRRFFPEKUAIVOQJHIUAJSDEEJLIOIIWTPDUZYGKOOFGWBTWTHWRVIARWMJPHWINNGVACNAEWDAGPUABJYXRBCECPHLWVPPIDACYGCXUZZACMVSFDVHFYWYSOGANLWLKLYNMYAITLYVJTLYUIPDNMHKGAOCADRGDTYTHEAAGYT
```

---

## 3 · THE SQUARE & THE SIGN

A magic square is given with the manuscript. It is the 3×3 **Lo Shu square**:

```
8 1 6
3 5 7
4 9 2
```

Every row, column and diagonal sums to **15**.

The manuscript's sign is the number **257**. Note what kind of number 257 is:
2⁸ + 1. (And recall: the primes are bound to the runes.)

---

## 4 · THE RULES (given with the book)

The book offers four rules. Each rule points at one step of the solution:

1. **The mirror reverses.** What ends where it begins is a circle.
2. **One letter never speaks.** It passes through every cipher untouched.
3. **The primes are sacred.** They cannot be divided. Subtract one.
4. **The square is 3.** It tells the order in which the final page must be read.

---

## 5 · THE COVER

The cover image (`clue.png`) is not merely decoration. Hidden inside it — in the
**least-significant bits of its pixels** — lies a single short phrase, written in
lowercase letters and hyphens (ASCII). It names the first door of the web trail.
(A tool to read it is included: run `tools/stego_extract.py clue.png`; the first
four bytes encode the length of the hidden message, in big-endian order.)

---

## 6 · THE WEB TRAIL (three doors)

After the three pages are decrypted, the trail continues on the web.

### DOOR 1 — the silent letter
> “One letter never speaks. It passes through every cipher untouched.
> Speak it, and the voice will sing.”

When the correct single letter is spoken, the page reveals:
```
dGhlLXZvaWNlLXNpbmdz
```
*(“the voice does not shout; decode it gently”)*

### DOOR 2 — the voice sings
> “I cannot be divided. Add one to the eighth power of two, and you will
> speak my name.” *(speak it as a number)*

When the correct number is spoken, the page reveals:
```
7468652d656e642d626567696e73
```
*(“the old tongue of sixteen symbols”)*

### DOOR 3 — the end begins
> The final page shows one last word, written in a tongue **shifted seven times**:
> ```
> WYPTVYKPBT
> ```

---

## 7 · WHAT TO DELIVER

1. The **full plaintext** of Page I, Page II, and Page III.
2. The **name of the key** that unlocks Page II (a single word, hinted by Page I).
3. The **two encoding methods** used in Door 1 and Door 2 (name them).
4. The **final word** from Door 3.
5. *(Optional)* The phrase hidden inside the cover image.

*“There is no prize at the end. There is only the message. And the message was
never hidden.”*
