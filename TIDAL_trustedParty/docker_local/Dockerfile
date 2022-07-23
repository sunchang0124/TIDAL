FROM nikolaik/python-nodejs:python3.7-nodejs12	

RUN apt-get update && apt-get install -y python-pip

RUN mkdir /input

RUN mkdir /output

RUN mkdir /login

RUN pip install \
  'pandas==0.25.1' \
  'numpy==1.17.2' \
  'scikit-learn==0.21.3' \
  'seaborn==0.10.0' \
  'pyreadstat==0.2.9'\
  'scipy==1.4.1' \
  'PyYAML==5.3' \
  'statsmodels==0.11.1'

RUN npm install \
  'csv-writer@1.6.0' \
  'rdflib@2.2.0'\
  'solid-node-client@2.0.2'\
  'fs@0.0.1-security'\
  'js-yaml@4.0.0'

ADD redacted_logging /usr/local/lib/python3.7/site-packages/redacted_logging/
ADD config.ini /

COPY run.py run.py
COPY subfunctions.py subfunctions.py
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY index.js index.js
COPY run.sh run.sh 

CMD ["sh", "run.sh"]
EXPOSE 3001
