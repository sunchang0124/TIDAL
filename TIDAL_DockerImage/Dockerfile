FROM nikolaik/python-nodejs:python3.6-nodejs14-stretch	

RUN apt-get update && apt-get install -y python-pip

RUN mkdir /input

RUN mkdir /output

RUN pip install \
  'pandas==0.25.1' \
  'numpy==1.17.2' \
  'scikit-learn==0.21.3' \
  'seaborn==0.10.0' \
  'bokeh==1.3.4' \
  'pyreadstat==0.2.9'\
  'scipy==1.4.1' \
  'PyYAML==5.3' \
  'statsmodels==0.11.1'

RUN npm install \
  'csv-writer' \
  'rdflib' \
  'solid-auth-cli'

ADD redacted_logging /usr/local/lib/python3.6/site-packages/redacted_logging/
ADD config.ini /

COPY run.py run.py
COPY subfunctions.py subfunctions.py
COPY package.json package.json
COPY index.js index.js 

CMD ["sh", "run.sh"]
EXPOSE 8081
