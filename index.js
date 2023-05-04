class GenerateQRCode {
  constructor() {
    this.container = document.querySelector('main');
    this.thumbnail = this.container.querySelector('figure img');
    this.element = this.container.querySelector('#qrcode');
    this.form = document.forms[0];
    this.options = {
      text: '',
      width: 256,
      height: 256,
      colorDark: '#000',
      colorLight: '#fff',
      correctLevel: QRCode.CorrectLevel.H
    }
    this.storageIdentifier = 'hlcx-qrcode';
  }

  reset() {
    this.element.innerHTML = '';
  }

  store(url) {
    console.log('.store', url);
    window.localStorage.setItem(this.storageIdentifier, JSON.stringify(url, null, 2));
  }

  generate(element, options) {
    const qrcode = new QRCode(element, options);
    console.log(qrcode)
  }

  generateThumbnail(url, height) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const {
          naturalWidth,
          naturalHeight
        } = img;
        const isPortrait = naturalHeight >= naturalWidth;
        const width = height * (isPortrait ? (naturalHeight / naturalWidth) : (naturalWidth / naturalHeight))
        console.log(img, width, height, naturalWidth, naturalHeight)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        console.log(width, height)
        canvas.width = width;
        canvas.height = height;

        if (isPortrait) {
          ctx.drawImage(img, 0, 0, height, width);
        } else {
          ctx.drawImage(img, 0, 0, width, height);
        }

        resolve(canvas.toDataURL());

        img.width = width;
        img.height = height;
      };
      img.onerror = reject;
      img.src = url;
    });
  }


  async display() {
    await this
    .generateThumbnail(this.options.text, this.thumbnail.parentElement.offsetHeight)
    .then(x => {
      this.thumbnail.src = x;
    })
  }

  async handleSubmit(event) {
    event.preventDefault();
    await this.reset();
    this.options.text = event.target.querySelector('input').value;
    await this.generate(this.element, this.options);
    await this.store(this.options.text);
    await this.display();
    console.log('submitted');
  }

  listen() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
  }

  async fetchFromStore() {
    const saved = window.localStorage.getItem(this.storageIdentifier)
    if (!saved) return;
    await this.generate(document.querySelector('#qrcode2'), JSON.parse(saved))
  }

  async init() {
    console.log('🎬 QRCode.start')
    await this.listen();
    console.log('🏁 QRCode.finish')
  }
}

const qr = new GenerateQRCode();
qr.init();

setTimeout(() => {
  // qr.fetchFromStore()
}, 3000)
