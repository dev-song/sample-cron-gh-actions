import fs from 'fs';
import Axios from 'axios';
import * as cheerio from 'cheerio';

async function getDataFromUrl(url: string) {
  try {
    const res = await Axios.get(url);
    return res;
  } catch {
    throw new Error('Data request failed!');
  }
}

function parseData(content: string) {
  const $ = cheerio.load(content);
  const numberElements = $('p.num').children('a#numView').children('span.ball_645');

  const numbersArr: Array<string> = [];
  numberElements.each((_, elm) => {
    numbersArr.push($(elm).text());
  });

  return numbersArr;
}

function recordNumbers(numbers: Array<string>) {
  const titleText = '# Lottery Result\n';
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth()}`.padStart(2, '0');
  const day = `${today.getDay()}`.padStart(2, '0');
  const todayText = `${today.toLocaleString()}\n`;
  const separator = `---------------------\n`;
  const numbersText = numbers.join('\n');
  const bonusNumberText = ' (Bonus)';
  const content = `${titleText}${todayText}${separator}${numbersText}${bonusNumberText}`;

  const dirPath = 'src/records';
  const filePath = `${dirPath}/${year}${month}${day}.md`;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const file = fs.openSync(filePath, 'w');
  fs.writeFileSync(file, content, 'utf-8');
  fs.closeSync(file);
}

async function main() {
  const lottUrl = 'https://www.dhlottery.co.kr/common.do?method=main';
  const data = await getDataFromUrl(lottUrl);
  const numbersArr = parseData(data.data);
  recordNumbers(numbersArr);
}

main();
