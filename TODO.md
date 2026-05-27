# TODO - Fix Turbopack panic

## Step 1
Edit `m-abbaslab/package.json` to disable Turbopack in dev (`NEXT_DISABLE_TURBOPACK=1 next dev`).

## Step 2
Edit `m-abbaslab/next.config.ts` to remove/disable the `turbopack` section that overrides `root`.

## Step 3
Delete `m-abbaslab/.next` and restart `next dev` to verify the panic is gone.

