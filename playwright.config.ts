import {defineConfig} from '@playwright/test';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE??(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'/usr/bin/chromium');
export default defineConfig({testDir:'./tests/browser',timeout:60000,use:{baseURL:'http://localhost:3001',launchOptions:{executablePath},headless:true},reporter:'list'});
