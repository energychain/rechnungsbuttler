#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const { program } = require('commander');

const fetcher = function(parameters) {
    (async () => {
      const browser = await puppeteer.launch({ headless: true }); // For Debugging
      const page = await browser.newPage();
      page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
      await page.goto('https://my.server4you.de/de/Generic/Auth/Index/login');
      await page.waitForSelector('input[name=username]');
      await page.evaluate((arg) =>  $('input[name=username]').val(arg),parameters.username);
      await page.evaluate((arg) =>  $('input[name=password]').val(arg),parameters.password);
      await page.evaluate(() =>  $('input[value=Einloggen]').click());
      await page.waitForSelector('.submenu');
      await page.goto('https://my.server4you.de/de/Customer/Invoice?');
      await page.waitForSelector('#openInvoices');
      await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: parameters.path
      });
{

}
      const invoices = await page.evaluate(() => {
          let links = $('a');
          let downloads = [];
          for(let i=0;i<links.length;i++) {
            if(links[i].href.startsWith('https://my.server4you.de/de/Customer/Invoice/Index/download/id/')) {
                downloads.push(links[i].href);
            }
          }
          return downloads;
      });

      for(let i=0;i<invoices.length;i++) {
        await page.evaluate((url) => {
            const link = document.createElement("a");
            link.setAttribute("href", url);
            document.body.appendChild(link);
            return link.click();
        },invoices[i]);
      }
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
if(options.username == null) {
  console.log('required parameter -u [account]');
  process.exit(1);
}
if(options.password == null) {
  console.log('required parameter -p [password]');
  process.exit(1);
}
if(options.path == null) {
  console.log('required parameter -d [path]');
  process.exit(1);
}
fetcher(options);
/*
fetcher({
  username:'epiktet',
  password:'w9xHccrH2hvO',
  path:'.'
});
*/
