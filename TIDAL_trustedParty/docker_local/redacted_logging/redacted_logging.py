#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Logging module for the PPDS project.

Introduce a NoStacktraceFormatter that can overwrite stacktrace information to
prevent leakage of sensitive information.

Provide a logger that reads its configuration from an *.ini file.

Example:
    Execute this module directly to create a logger and log a few events.

    Use as a module in other scripts:

        import redacted_logging as rlog

        logger = rlog.get_logger(__name__)
        logger.error("error message")


Attributes:
    CONFIG_FILE (str): Location and name of the default config file. This
        *.ini style has a few mandatory entries:
            - [settings].log_file: log file path and name
            - [settings].redacted_stacktrace_message: replace tracebacks
            - standard logger settings in fileConfig format

Raises:
    FileNotFoundError: If the config file cannot be found.
    configparser.MissingSectionHeaderError: When CONFIG_FILE is malformed.
"""

import configparser
import logging.config
import os.path

CONFIG_FILE = "./config.ini"

def docstring_parameter(**kwargs):
    """ Decorates a function to update the docstring with a variable. This
    allows the use of (global) variables in docstrings.

    Example:
        @docstring_parameter(config_file=CONFIG_FILE)
        myfunc():
        \"\"\" The config file is {config_file} \"\"\"

    Args:
        **kwargs: Declarations of string formatters.

    Raises:
        KeyError: If formatters are not found in the docstring.
    """
    def decorate(obj):
        obj.__doc__ = obj.__doc__.format(**kwargs)
        return obj
    return decorate

def probe_config_file(config_file):
    """ Check for the existance of a config file for the logger.

    `configparser` does not give a sane error message for missing files,
     this is more understandable.

    Args:
        config_file (str): Name of the config file.

    Raises:
        FileNotFoundError: If config_file is not found.
    """
    if not os.path.isfile(config_file):
        raise FileNotFoundError("Config file " + config_file + " " +
                                "does not exist. Create it or use " +
                                "get_logger(__name__, " +
                                "config_file=\"./my_config_file\") to " +
                                "point to another name or location.")


class NoStacktraceFormatter(logging.Formatter):
    """ Custom formatter redacting stacktrace messages for privacy.

    Behaves exactly like logging.Formatter, but with an attribute `message`.
    When the record contains `record.exc_text`, the formatted record is
    overwritten by the attribute self.message which is read from the
    `settings.redacted_stacktrace_message` of the CONFIG_FILE.

    Attributes:
        message (str): Redaction message read from CONFIG_FILE, used to
            overwrite stacktrace information in formatted records.

    Raises:
        configparser.MissingSectionHeaderError: When CONFIG_FILE is malformed.
    """

    def __init__(self, *args):
        super().__init__(*args)
        probe_config_file(CONFIG_FILE)
        config = configparser.ConfigParser()
        config.read(CONFIG_FILE)
        self.message = config.get('settings', 'redacted_stacktrace_message')

    def format(self, record):
        """ Custom logging formatter, will redact stacktrace messages. """
        formatted_record = super(NoStacktraceFormatter, self).format(record)
        if record.exc_text:
            formatted_record = self.message
        return formatted_record


@docstring_parameter(CONFIG_FILE=CONFIG_FILE)
def get_logger(name, config_file=None):
    """ Create a logger configured with settings from the CONFIG_FILE.

    Args:
        name (str): Name of the logger. `__name__` is highly recommended.
        config_file (str, optional): Config file for logging, default is the
            global {CONFIG_FILE}

    Raises:
        configparser.MissingSectionHeaderError: When CONFIG_FILE is malformed.
    """
    global CONFIG_FILE
    if config_file is not None:
        CONFIG_FILE = config_file
    probe_config_file(CONFIG_FILE)
    config = configparser.ConfigParser()
    config.read(CONFIG_FILE)
    log_file = config.get('settings', 'log_file')
    logging.config.fileConfig(CONFIG_FILE,
                              defaults={'log_file': log_file},
                              disable_existing_loggers=False)
    logger = logging.getLogger(name)
    return logger


def main():
    """Demonstrate the usage of this module.

    Create logger and log a few events.

    Raises:
        ZeroDivisionError: Always, as an example.
    """
    logger = get_logger(__name__)

    # Test messages
    logger.debug("Harmless debug Message")
    logger.info("Just an information")
    logger.warning("Its a Warning")
    logger.error("Did you try to divide by zero")
    logger.critical("Internet is down")

    try:
        1/0
    except ZeroDivisionError as expected_error:
        # `exc_info=True` includes the Traceback into the log
        # Both of the following variants will log an error including traceback.
        logger.error("Antimatter coalesced, traceback included. Message: %s",
                     expected_error, exc_info=True)
        logger.exception("Black hole and traceback created. Message: %s",
                         expected_error)

    logger.info("Script goes on after catching exceptions")


if __name__ == "__main__":
    main()
