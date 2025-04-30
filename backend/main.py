from flask import Flask, request, jsonify
from flask_cors import CORS
import csv, os

app = Flask(__name__)
CORS(app)

filename = "schedule.csv"

def setup():
    if not os.path.exists(filename) or os.path.getsize(filename) == 0:
        with open(filename, 'w', newline='') as schedule:
            writer = csv.writer(schedule)
            writer.writerow(["Name", "Appliance", "StartTime", "EndTime", "Success"])

def cleanup():
    with open(filename, 'r') as infile:
        reader = list(csv.reader(infile))
    if not reader:
        return
    header = reader[0]
    rows = [row for row in reader[1:] if any(cell.strip() for cell in row)]
    with open(filename, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(header)
        writer.writerows(rows)

def parseTime(time_str):
    if not time_str or ':' not in time_str:
        raise ValueError(f"Invalid time format: '{time_str}'")
    h, m = map(int, time_str.split(':'))
    return (h * 60 + m)

def validate(data):
    cleanup()
    with open(filename, 'r', newline='') as entries:
        reader = csv.reader(entries)
        header = next(reader)
        array = [row for row in reader]

    appliance = data['appliance']
    name = data['name']
    start = parseTime(data['startTime'])
    end = parseTime(data['endTime'])

    if start >= end:
        return [False, "Invalid time range"]

    for i, row in enumerate(array):
        if row[1] == appliance:
            rowStart = parseTime(row[2])
            rowEnd = parseTime(row[3])
            if (start < rowEnd and end > rowStart):
                if row[0] == name:
                    array[i] = [name, appliance, data['startTime'], data['endTime'], "Existing reservation found, overwriting it"]
                    with open(filename, "w", newline='') as entries:
                        writer = csv.writer(entries)
                        writer.writerow(header)
                        writer.writerows(array)
                    return [True, "Existing reservation found, overwriting it"]
                else:
                    return [False, "This appliance is already reserved by someone else"]

    return [True, None]

@app.route("/api/schedule", methods=["GET"])
def get_schedule():
    setup()
    cleanup()
    array = []
    with open(filename, 'r') as schedule:
        reader = csv.reader(schedule)
        try:
            next(reader)
        except StopIteration:
            return jsonify([])
        for row in reader:
            if len(row) >= 4:
                array.append({
                    "name": row[0],
                    "appliance": row[1],
                    "startTime": row[2],
                    "endTime": row[3],
                    "success": row[4]
                })
    return jsonify(array)

@app.route("/api/reserve", methods=["POST"])
def reserve_slot():
    data = request.get_json()
    required_fields = ['name', 'appliance', 'startTime', 'endTime']

    if not all(k in data and data[k] for k in required_fields):
        return jsonify({"success": False, "message": "Missing or empty fields", "data": data}), 400

    output = validate(data)

    if output[1] is None:
        message = "Reservation successful"
        with open(filename, 'a', newline='') as schedule:
            writer = csv.writer(schedule)
            writer.writerow([data['name'], data['appliance'], data['startTime'], data['endTime'], message])
    else:
        message = output[1]

    

    return jsonify({"success": output[0], "message": message, "data": data})

setup()

if __name__ == "__main__":
    app.run(debug=True)
