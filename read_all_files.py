# Python script to read and process all_files_after_pull.txt

def main():
    filename = 'all_files_after_pull.txt'

    try:
        with open(filename, 'r', encoding='utf-8') as file:
            lines = [line.rstrip('\n') for line in file]
    except FileNotFoundError:
        print(f"File not found: {filename}")
        return

    # Print basic info
    print(f"\n--- Reading file: {filename} ---")
    print(f"Total lines: {len(lines)}")
    print("First 20 lines (preview):\n")
    for line in lines[:20]:
        print(line)
    print("\n--- End of preview ---\n")

    # Count number of files and folders
    file_count, dir_count = 0, 0
    for line in lines:
        # Look for typical ls -lR line formats
        if line.startswith('d'):  # directory line in ls -l
            dir_count += 1
        elif line.startswith('-'):  # file line in ls -l
            file_count += 1

    print(f"Number of files: {file_count}")
    print(f"Number of directories: {dir_count}")

    # Prompt for a search term (OPTIONAL)
    search = input("Enter a search word or pattern (or just press Enter to skip): ").strip()
    if search:
        matches = [line for line in lines if search.lower() in line.lower()]
        print(f"\n--- Lines containing '{search}' ---\n")
        for match in matches:
            print(match)
        print(f"\nTotal matches: {len(matches)}")
    else:
        print("(No search performed)")

    print("\n--- Done! ---")

if __name__ == "__main__":
    main()
