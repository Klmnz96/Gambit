# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JavaScript without frameworks or build tools (the developer's apprenticeship is still at JavaScript fundamentals). Self-hosted fonts. Runs locally and on GitHub Pages.

## Users

- **The beginner** (primary): someone who does not know how to play chess and wants to learn it by playing, alone on a laptop or desktop. The developer is this user too: they cannot play chess yet and are building Gambit partly to learn it.
- **Two people at one device**: friends or family playing each other on the same screen, taking turns.
- **Portfolio visitors**: recruiters and instructors looking at the project on GitHub.

## Product Purpose

A chess game you can learn chess with. It is playable from the first minute without prior knowledge, and the trainer turns every move into a short, plain-language lesson until the player switches it off. Success: a complete beginner can finish a game against the computer and understand why the moves were allowed, good or bad.

## Positioning

Most chess sites assume you already know the rules. Gambit's trainer explains as you play: how the selected piece moves, which squares are legal, when your king is in check, and afterwards why a move was weak (for example a piece left unprotected). Experienced players turn it off and get a clean board.

## Operating Context

Played in a desktop or laptop browser, with mouse or trackpad; should also work on a phone. Sessions are short and casual. No accounts, no server, no online play.

## Capabilities and Constraints

- Modes: two players on one device; one player against a computer opponent with difficulty levels from beginner to grandmaster. Lower levels come from Gambit's own AI (written in this project); the strongest levels are planned with the open-source Stockfish engine (WebAssembly, GPL licence, strength limited by Elo).
- Full chess rules, including check, checkmate, stalemate, castling, pawn promotion and en passant.
- Trainer (switchable per player, on by default): shows legal squares, explains each piece when selected, warns about check, gives move tips and explains why a move was weak. Switched off, the board is clean with no hints; the setting is remembered between visits.
- Interface language: German (piece names König, Dame, Turm, Läufer, Springer, Bauer).
- Undecided: whether games are saved between visits; move history format; sounds.

## Brand Commitments

Name: **Gambit**. Must look modern and not like a typical chess site (no default green-and-white board look, no generic wooden template).

## Evidence on Hand

No content yet. No piece artwork yet: pieces must be drawn as SVG or taken from an openly licensed set and credited.

## Product Principles

1. Playable without knowing chess: the first move must be possible without reading anything.
2. Explain, don't lecture: one short sentence at the moment it matters.
3. The trainer can always be switched off; the game never depends on it.
4. Honest rules: every chess rule is implemented, nothing simplified for convenience.

## Accessibility & Inclusion

Board must be usable by keyboard and readable by screen readers (square names like "e4", piece names). Colour is never the only signal for legal moves or check.
