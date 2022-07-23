#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
This script is to generate an (statistical) overview about the data.
Users need to configure the request.yaml to indicate what basic information they want to know about the data.
Until 25-03-2020, the following functions has been implemented in this script:
1. Basic description of data (from pandas.dataframe.desribe)
2. Missing values and percentage of each variables
3. Correlation Matrix (plot)
4. Histogram distributed plot
5. Box distribution plot
6. Relations plot between different variables (numerical-numercial features, categorical-numerical features)
"""

import time
import ntpath
from collections import Counter
import yaml
import pandas as pd
import subfunctions

import redacted_logging as rlog
logger = rlog.get_logger(__name__)

import warnings
warnings.filterwarnings('ignore')

def load_yaml_file(file_name, logger):
    """loads a yaml file, logs to logger if errors occur

    Args:
        file_name (str): File name of the YAML file to be loaded.
        logger (logging.Logger): Logger class handling log messages.

    Returns:
        dict: yaml file content as a dictionary.
    """
    try:
        with open(file_name) as file:
            input_yaml = yaml.load(file, Loader=yaml.FullLoader)
            logger.debug("Reading config.yaml file...")
    except yaml.parser.ParserError:
        logger.error(f"File {file} is not valid YAML.")
        raise
    except FileNotFoundError:
        logger.error(f"Trying to read file '{file}', but it does not exist.")
        raise

    return input_yaml

def get_data_from_file(file_path, file_sep, logger):
    """Read data from a '.csv' file, or load it from a '.sav' file.

    Args:
        file_path (str): Path of the data file.
        file_sep (str): Separator for the '.csv' file.
        logger (logging.Logger): Logger class handling log messages.

    Raises:
        FileNotFoundError: If the data file can not be found.

    Returns:
        pandas.core.frame.DataFrame: Data in a data frame.
    """
    try:
        if '.csv' in file_path:
            data_frame = pd.read_csv(file_path, sep=file_sep)
    except FileNotFoundError:
        logger.error("The data file does not exist!")
        raise

    return data_frame


def main():
    """main function

    The main function will read the configuration file (request.yaml) and obtain the requeired parameters. 
    After reading the data file, the varilables will be selected by users input.
    Execute the functions of generating basic description of data, checking cokpleteness, plotting correlation metrix, distribution plots.
    """
    start_time = time.time()
    
    logger = rlog.get_logger(__name__)
    input_yaml_file_name = "./input/config.yaml"
    input_yaml = load_yaml_file(input_yaml_file_name, logger)
    
    # Read data path and delimiter from configuration file
    try:
        file_path = "./input/data_file.csv"# input_yaml['data_file']
        file_sep = ','
    except KeyError:
        logger.error("config.yaml file is not valid. Please consult the example ")

    # Read data (csv or sav)
    file_name = ntpath.basename(file_path).split('.')[0]

    data_frame = get_data_from_file(file_path, file_sep, logger)
    column_names = data_frame.columns

    # Check missing values in the dataset
    if input_yaml['check_missing']:
        subfunctions.check_missing(data_frame, column_names, file_name)

    # Get the basic description about the dataset
    if input_yaml['data_description']:
        subfunctions.data_describe(data_frame, column_names, file_name)

    # Function for correlation matrix
    if input_yaml['correlation_matrix']:
        subfunctions.corr_Matrix(data_frame, file_name)

    # Analysis model
    analysis_model_name = input_yaml['analysis_model_name']
    analysis_model_target = input_yaml['analysis_model_target']


    if analysis_model_name in ["linear regression", "logistic regression"]:
        subfunctions.analysis_model(data_frame, analysis_model_name, analysis_model_target, file_name)
    else:
        logger.warings("analysis_model_name is not valid.")

    end_time = time.time()
    run_time = end_time - start_time
    logger.info("Data analysis took {runtime:.4f}s to run.".format(runtime=run_time))

if __name__ == "__main__":
    main()