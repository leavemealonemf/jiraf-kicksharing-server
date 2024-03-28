// SMSC.RU API (smsc.ru) версия 1.2 (08.11.2021)
import * as http from 'http';
import * as qs from 'querystring';
import * as FormData from 'form-data';
import * as fs from 'fs';

class SmsApi {
  private http: typeof http;
  private qs: typeof qs;
  private FormData: typeof FormData;
  private fs: typeof fs;
  private ssl: boolean;
  private def_fmt: number;
  private host: string;
  private charset: string;
  private login: string;
  private password: string;
  private sender: any;
  private log: any;
  private PHONE_TYPES: { [key: string]: number };

  constructor() {
    this.http = require('http');
    this.qs = require('querystring');
    this.FormData = require('form-data');
    this.fs = require('fs');
    this.ssl = false;
    this.def_fmt = 3;
    this.host = 'smsc.ru';
    this.charset = 'utf-8';
    this.login = 'strangemisterio';
    this.password = '505e48ff8b83df7990b8f17c6d6e13cbdcff7614';
    this.sender = undefined;
    this.log = console.log;
    this.PHONE_TYPES = {
      string: 1,
      number: 2,
    };
  }

  private get_host(www?: string): string {
    if (!www) www = '';
    return (this.ssl ? 'https://' : 'http://') + www + this.host + '/sys/';
  }

  private isInArr(arr: any[], val: any): boolean {
    if (!arr || !arr.length) return false;
    return arr.indexOf(val) !== -1;
  }

  private convert_data(data: any, notConvert: any): void {
    if (data.fmt) delete data.fmt;
    if (data.msg) {
      data.mes = data.msg;
      delete data.msg;
    }
    if (data.message) {
      data.mes = data.message;
      delete data.message;
    }
    if (data.phone && !this.isInArr(notConvert, 'phone')) {
      data.phones = data.phone;
      delete data.phone;
    }
    if (data.number) {
      data.phones = data.number;
      delete data.number;
    }
    if (data.list) {
      let list = '';
      for (let i in data.list) {
        list += i + ':' + data.list[i] + '\n';
      }
      data.list = list;
      delete data.mes;
    }
    if (data.phones && !((typeof data.phones) in this.PHONE_TYPES))
      data.phones = data.phones.join(',');
  }

  private convert_files(form: any, data: any): void {
    if (!data.files) return;
    if (typeof data.files === 'string') {
      const f = data.files;
      const bin = this.fs.readFileSync(f);
      form.append(f, bin, {
        filename: f,
      });
      return;
    }
    for (const i in data.files) {
      const f = data.files[i];
      const bin = this.fs.readFileSync(f);
      form.append(i, bin, {
        filename: f,
      });
    }
    delete data.files;
  }

  private read_url(prs: any, clb: any, notConvert?: any): void {
    const fmt = prs.fmt ? prs.fmt : this.def_fmt;
    const fd = new this.FormData();
    fd.append('fmt', fmt);
    fd.append('login', this.login);
    fd.append('psw', this.password);
    fd.append('charset', this.charset);
    if (prs.type) fd.append(prs.type, 1);
    if (prs.data) {
      this.convert_data(prs.data, notConvert);
      if (prs.data.files) {
        this.convert_files(fd, prs.data);
      }
      for (let i in prs.data) {
        fd.append(i, prs.data[i]);
      }
    }
    let www = '';
    let count = 0;
    const submit = () => {
      fd.submit(this.get_host(www) + prs.file, (err: any, res: any) => {
        if (err) {
          if (count++ < 5) {
            www = 'www' + (count !== 1 ? count : '') + '.';
            submit();
          } else {
            const error = {
              error: 'Connection Error',
              error_code: 100,
            };
            clb(error, JSON.stringify(error), error.error, error.error_code);
          }
          return;
        }
        res.setEncoding(this.charset);
        let full_data = '';
        res.on('data', (data: any) => {
          full_data += data;
        });
        res.on('end', (data: any) => {
          if (clb) {
            const d = JSON.parse(full_data);
            clb(
              d,
              full_data,
              d.error_code ? d.error : null,
              d.error_code ? d.error_code : null,
            );
          }
        });
      });
    };
    submit();
    return;
  }

  // Конфигурирование
  public configure(prs: any): void {
    this.ssl = !!prs.ssl;
    this.login = prs.login;
    this.password = prs.password;
    if (prs.charset) this.charset = prs.charset;
  }

  // Отправка сообщения любого типа (data — объект, включающий параметры отправки. Подробнее смотрите в документации к API)
  public send(type: string, data: any, clb: any): void {
    if (typeof data !== 'object') data = {};
    const opts = {
      file: 'send.php',
      data: data,
    };
    opts['type'] = type;
    this.read_url(opts, clb);
  }

  // Отправка простого SMS сообщения
  public send_sms(data: any, clb: any): void {
    if (typeof data !== 'object') data = {};
    this.read_url(
      {
        file: 'send.php',
        data: data,
      },
      clb,
    );
  }

  // Получение статуса сообщения
  public get_status(data: any, clb: any): void {
    if (data.phones) {
      data.phone = data.phones;
      delete data.phones;
    }
    if (data.number) {
      data.phone = data.number;
      delete data.number;
    }
    if (data.phone && !((typeof data.phone) in this.PHONE_TYPES)) {
      data.phone = data.phone.join(',');
    }
    this.read_url(
      {
        file: 'status.php',
        data: data,
      },
      clb,
      ['phone'],
    );
  }

  // Получение баланса
  public get_balance(clb: any): void {
    this.read_url(
      {
        file: 'balance.php',
        data: {
          cur: 1,
        },
      },
      (b: any, r: any, e: any, c: any) => {
        clb(e ? 0 : b.balance, r, e, c);
      },
    );
  }

  // Получение стоимости сообщения
  public get_sms_cost(data: any, clb: any): void {
    if (typeof data !== 'object') data = {};
    if (!data.cost) data.cost = 1;
    this.read_url(
      {
        file: 'send.php',
        data: data,
      },
      (b: any, r: any, e: any, c: any) => {
        clb(e ? 0 : b.cost, r, e, c);
      },
    );
  }

  // Запрос к API
  public raw(file: string, data: any, clb: any): void {
    this.read_url(
      {
        file: file,
        data: data,
      },
      clb,
    );
  }

  // Тестирование подключ��ния и данных авторизации
  public test(clb: any): void {
    this.read_url(
      {
        file: 'balance.php',
      },
      (d: any, r: any, err: any) => {
        clb(err);
      },
    );
  }
}

export default new SmsApi();
