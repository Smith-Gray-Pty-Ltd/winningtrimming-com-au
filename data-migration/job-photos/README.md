# Job Photo Folders

One folder per LOGICAL JOB (deposit + remainder + quote merged into one).
Drop any images you have for each job into its `photos/` folder.

## Structure

```
job-photos/
  {customer name}/
    {job_id}_{date}_{description-slug}/
      info.json     <- merged job metadata (all job card numbers listed)
      photos/       <- PUT IMAGES HERE
```

## Notes

- 132 logical job folders (chains from job-chains.json)
- `info.json` has `job_card_numbers` (all source records) and `members` (roles: quote/deposit/final)
- Folder name is keyed to the chain root job card number (stable ID)
- Quotes that never became jobs get their own folder (may have "before" photos)

## Flagged records (needs manual review)

- Bill Anderson: 50077 — 
- Kale Ward: 50103 — <p>Awning, bimini made with Aquatica white hooding.  Clears made with Regalite sheet clear.  $10.660

## After adding photos

1. Add images to `photos/`
2. Tell the assistant which folders are portfolio-worthy
3. Import script: uploads media -> creates booking/project -> links photos
