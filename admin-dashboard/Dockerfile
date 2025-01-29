# Temel görüntü
FROM node:18.18.0

# Çalışma dizini oluşturun
WORKDIR /app

# paket.json ve package-lock.json'ı kopyalayın
COPY package*.json ./

# Bağımlılıkları yükleyin
RUN npm install

# Proje dosyalarını kopyalayın
COPY . .

# Üretim için derleyin
RUN npm run build

# Uygulamanızın çalışacağı port
EXPOSE 3000

# Uygulamayı başlatın
CMD ["npm", "start"]