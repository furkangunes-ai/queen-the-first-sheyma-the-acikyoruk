const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('/Users/furkangunesi/Downloads/YKS/YKS_2026_Mufredat_Kazanimlar.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

// ---- Step 1: Analyze structure ----
const topicsBySubject = {};

for (const row of data) {
  const key = row['Sınav'] + '|' + row['Ders'];
  if (!topicsBySubject[key]) topicsBySubject[key] = new Map();
  const topicKey = row['Konu Sıra'] + '|' + row['Konu Adı'];
  if (!topicsBySubject[key].has(topicKey)) {
    topicsBySubject[key].set(topicKey, {
      name: row['Konu Adı'],
      sira: row['Konu Sıra'],
      sinif: row['Sınıf'],
      area: row['Öğrenme Alanı'],
      count: 0
    });
  }
  topicsBySubject[key].get(topicKey).count++;
}

for (const [subj, topics] of Object.entries(topicsBySubject)) {
  console.log('\n' + subj + ' (' + topics.size + ' konu):');
  for (const [k, v] of topics) {
    console.log('  [' + v.sira + '] ' + v.name + ' (' + v.count + ' kaz, sinif: ' + v.sinif + ', alan: ' + v.area + ')');
  }
}
console.log('\nToplam satır:', data.length);

// ---- Step 2: Export full JSON for further processing ----
fs.writeFileSync('/tmp/yks_excel_data.json', JSON.stringify(data, null, 2));
console.log('\n✅ JSON exported to /tmp/yks_excel_data.json');
