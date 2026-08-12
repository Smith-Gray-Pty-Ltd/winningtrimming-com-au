# Job Photo Folders

Drop any images you have for each job into its `photos/` folder.
The import script uses `info.json` to link photos to the right Payload booking.

## Structure

```
job-photos/
  {customer name}/
    {job_card_number}_{date}_{description-slug}/
      info.json     <- job metadata (auto-generated)
      photos/       <- PUT IMAGES HERE (any format, keep original names)
```

## Notes

- 168 job folders created (real jobs + quotes with value)
- 8 placeholder rows skipped ($$0, no description)
- Jobs with `invoice_type` Q = quotes (may still have "before" photos worth keeping)
- Folder names won't change — they're keyed to `job_card_number` (stable ID)
- If a job has no photos, leave the folder empty or delete it; import will skip it

## After adding photos

1. Add images to `photos/`
2. Tell the assistant which folders are portfolio-worthy
3. The import script will: upload images to Payload media → create project →
   link project to booking
