#!/bin/sh
gcloud run deploy quiz --region asia-northeast1 --project=xxxx --source . --env-vars-file=.env.yaml
