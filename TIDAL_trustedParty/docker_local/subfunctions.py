#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
This script a sub-function file for requestBasicInfo.py script.
This script includes the implementation of the following functions
1. "data_describe": Basic description of data (from pandas.dataframe.desribe)
2. "check_missing": Missing values and percentage of each variables
3. "corr_Matrix": Correlation Matrix (plot)
4. "cate_Dist", "dist_Plot", "make_hist_plot": Histogram distributed plot
5. "box_Plot": Box distribution plot
6. "plot_numNum", "plot_catNum": Relations plot between different variables (numerical-numercial features, categorical-numerical features)

"""

import os
import sys
import numpy as np
import pandas as pd
import seaborn as sns
import statsmodels.api as sm
from collections import Counter
import matplotlib.pyplot as plt
# from bokeh.transform import factor_cmap
# from bokeh.models import ColumnDataSource
# from bokeh.plotting import figure,save
# from bokeh.palettes import Spectral10


import redacted_logging as rlog
logger = rlog.get_logger(__name__)

###########################################
### Function for checking missing values ##
###########################################
def check_missing(data_frame, column_names, file_name):
    """check missing values in all variables, write the missing values table as an output file

    Args:
        data_frame (pandas.DataFrame): the dataset with selected features.
        column_names (list) : the column names of data_frame
        file_name(str): the name of the input data file

    Returns:
        No return variables but generate "output/*file_name*_missings.csv"
    """
    
    ##### Search missing valves #####
    missing  = 0
    misVariables = []
    CheckNull = data_frame.isnull().sum()
    for variable_item in range(0, len(CheckNull)):
        if CheckNull[variable_item] != 0:
            misVariables.append([column_names[variable_item], CheckNull[variable_item], round(CheckNull[variable_item]/len(data_frame),3)])
            missing = missing + 1

    if missing == 0:
        logger.info('Dataset is complete with no blanks.')
    else:
        logger.info('Totally, %d features have missing values (blanks).' %missing)
        df_misVariables = pd.DataFrame.from_records(misVariables)
        df_misVariables.columns = ['Variable', 'Missing', 'Percentage (%)']
        sort_table = df_misVariables.sort_values(by=['Percentage (%)'], ascending=False)
        # display(sort_table.style.bar(subset=['Percentage (%)'], color='#d65f5f'))
        
        outputFile = './output/%s_missings.csv' %file_name
        os.makedirs(os.path.dirname(outputFile), exist_ok=True)
        sort_table.to_csv(outputFile)
        logger.info('Check missing outcome is saved to ./output/%s_missings.csv' %file_name)
    logger.debug('Missing values check is done!')

def data_describe(data_frame, column_names, file_name):
    """Generate basic description table for the data set by using Pandas.DataFrame.describe(), write out the table to a file 

    Args:
        data_frame (pandas.DataFrame): the dataset with selected features.
        column_names (list) : the column names of data_frame
        file_name: the name of the input data file

    Returns:
        No return variables but generate "*file_name*/%s_describe.csv"
    """
    outputFile = './output/%s_describe.csv' %file_name
    os.makedirs(os.path.dirname(outputFile), exist_ok=True)
    data_frame.describe().to_csv(outputFile)
    logger.info('There is %d rows and %d columns' %(len(data_frame), len(column_names)))
    logger.debug('Data description is done!')


###########################################
### Function for plot Correlation Matrix ##
###########################################
def corr_Matrix(data_frame, file_name):
    """Calculate the correlation matrix of all features and plot the matrix in a heatmap figure saved in PNG format

    Args:
        data_frame (pandas.DataFrame): the dataset with selected features.
        file_name: the name of the input data file

    Returns:
        No return variables but generate "output/Output_CM/*file_name*.png"
    """
    sns.set(style="white")
    corr = data_frame.corr() 
    # Generate a mask for the upper triangle
    mask = np.zeros_like(corr, dtype=np.bool)
    mask[np.triu_indices_from(mask)] = True

    # Set up the matplotlib figure
    f, ax = plt.subplots(figsize=(15, 15))

    # Generate a custom diverging colormap
    cmap = sns.diverging_palette(220, 10, as_cmap=True)

    # Draw the heatmap with the mask and correct aspect ratio
    sns.heatmap(corr,  cmap=cmap, annot=False, vmax=0.7, vmin=-0.7, #mask=mask,#center=0,
                square=True, linewidths=.2, cbar_kws={"shrink": 0.8})
    plt.title('Correlation Matrix in %s' % file_name)

    filename = './output/Output_CM/%s.png' %file_name
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    plt.savefig(filename)
    logger.debug('Correlation Matrix plot is done')
    plt.clf()

def analysis_model(data_frame, analysis_model_name, analysis_model_target, file_name):

    Y = data_frame[analysis_model_target]
    X = data_frame.drop([analysis_model_target], axis=1)
    X = sm.add_constant(X)
    model = sm.OLS(Y,X)
    results = model.fit().summary()

    ### Write results out to a csv file ###
    filename = './output/%s_%s.csv' %(analysis_model_name, file_name)
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename,'w') as outputFile:
        outputFile.write(results.as_csv())
    logger.debug("Statmodels result is done!")
