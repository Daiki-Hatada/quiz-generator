#!/bin/sh

usage() {
    echo "Usage: $0 input.yaml output.env"
    exit 1
}

if [ "$#" -ne 2 ]; then
    usage
fi

INPUT_FILE="$1"
OUTPUT_FILE="$2"

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' does not exist."
    exit 1
fi

# Initialize output file
> "$OUTPUT_FILE"

while IFS= read -r line
do
    line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

    [[ -z "$line" || "$line" =~ ^# ]] && continue

    if [[ "$line" =~ ^([^:]+):[[:space:]]*\"?(.*)\"?$ ]]; then
        KEY="${BASH_REMATCH[1]}"
        VALUE="${BASH_REMATCH[2]}"

        KEY=$(echo "$KEY" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
        VALUE=$(echo "$VALUE" | sed -e 's/^[[:space:], "]*//' -e 's/[[:space:], "]*$//')

        echo "${KEY}=\"${VALUE}\"" >> "$OUTPUT_FILE"
    else
        echo "Warning: Skipping invalid line: $line"
    fi
done < "$INPUT_FILE"

echo "Conversion complete. Output saved to '$OUTPUT_FILE'."
