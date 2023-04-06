let tags = [];

// CSV 파일에서 데이터 추출
function parseCSV(csv) {
    const rows = csv.split('\n').slice(1);
    const data = rows.filter(row => row.length > 0).map(row => row.split(','));
    return data;
}

// 명함 생성
function createNameTag(name, affiliation, city, country) {
    const tag = document.querySelector('#nametag-template').cloneNode(true);
    tag.querySelector('.name').innerHTML = name;
    tag.querySelector('.affiliation').innerHTML = affiliation;
    tag.querySelector('.city').innerHTML = `${city}, ${country}`;
    // tag.querySelector('.country').innerHTML = country;
    tag.removeAttribute('id');
    tag.classList.remove('hidden');
    return tag;
}

// 명함 이미지로 변환
function saveNameTagAsImage(tag) {
    return html2canvas(tag).then(canvas => canvas.toDataURL('image/png'));
}

// 압축파일 생성 및 다운로드
function saveZip(images, name) {
    const zip = new JSZip();

    images.forEach((dataUrl, index) => {
        const base64 = dataUrl.split(',')[1];
        zip.file(`${name}-${index + 1}.png`, base64, { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then(blob => {
        saveAs(blob, `${name}.zip`);
    });
}

// 파일 업로드 및 처리
document.querySelector('#csv-file')
    .addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        document.querySelector('#output').innerHTML = '';
        tags = [];

        reader.readAsText(file);

        reader.onload = () => {
            const csv = reader.result;
            const data = parseCSV(csv);
            const promises = [];

            data.forEach(row => {
                const [name, city, affiliation] = row;
                const tag = createNameTag(name, city, affiliation);
                document.querySelector('#output').appendChild(tag);
            });
        };
    });

// 다운로드 버튼 이벤트
document.querySelector('#download')
    .addEventListener('click', (event) => {
        promises = [];
        
        document.querySelectorAll('.nametag').forEach(tag => {
            promises.push(saveNameTagAsImage(tag, name));
        });

        Promise.all(promises).then(images => {
            saveZip(images, 'nametags')
        })
    });

const sample=`Name,Affiliation,City,Country\n
Seongbum Seo,Sejong University,Seoul,Korea\n
Seongbom Seo,Jongse University,Seoul,Korea\n
`;
const data = parseCSV(sample);

data.forEach(row => {
    const [name, affiliation, city, country] = row;
    const tag = createNameTag(name, affiliation, city, country);
    document.querySelector('#output').appendChild(tag);
});
