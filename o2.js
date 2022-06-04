#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const { program } = require('commander');

const fetcher = function(parameters) {
    (async () => {
      const browser = await puppeteer.launch({ headless: true }); // For Debugging
      const page = await browser.newPage();
      page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
      await page.goto('https://login.o2online.de/auth/login?goto=https%3A%2F%2Fwww.o2online.de%2Fmein-o2%2F');
      await page.waitForSelector('#IDToken1');
      await page.evaluate((arg) =>  $('#IDToken1').val(arg),parameters.username);
      await page.evaluate(() =>  $('#login-username-submit-button').click());
      await page.waitForSelector('input[type=password]');
      await page.evaluate((arg) =>  $('input[type=password]').val(arg),parameters.password);
      await page.evaluate(() =>  $('button[type=submit]').click());
      await page.waitForSelector('.csc-nav');
      await page.goto("https://www.o2online.de/ecareng/billing/uebersicht");
      await page.waitForSelector('.medallia');
      await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: parameters.path
      });
      await page.evaluate(() => {
        let links = $(".medallia")
        const download = async function() {
          await new Promise(r => setTimeout(r, 2000));
          for(let i=0;i<links.length;i++) {
              await links[i].click();
              await new Promise(r => setTimeout(r, 2000));
          }
        }
        download();
      })
    //  await page.waitForSelector('.sdsdcsc-nav');
    await new Promise(r => setTimeout(r, 20000));
    await browser.close();
    })();
}



program
  .option('-u --username [account]','Username of service')
  .option('-p --password [password]','Password of service')
  .option('-d --path [folder]','Directory to store retrieved PDF invoices to (relative to runtime)')

  program.parse();
const options = program.opts();
const args = program.args;

fetcher(options);
/*
fetcher({
  username:'epiktet',
  password:'w9xHccrH2hvO',
  path:'.'
});
*/
