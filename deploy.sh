#!/bin/sh
gcloud run deploy quiz --region asia-northeast1 --project=vertex-ai-api-413406 --source . --env-vars-file=.env.yaml
