#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
This script demonstrates the usage of the redacted_logging module.
"""

import redacted_logging


def main():
    """ Create logger and log some messages."""
    logger = redacted_logging.get_logger(__name__)
    logger.debug("Harmless debug Message")
    logger.info("Just an information")
    logger.warning("It's a Warning")
    logger.error("Did you try to divide by zero")
    logger.critical("Internet is down")

    # External libraries don't have privacy-preserving logging. We need to
    # wrap it in a try-except(-else) block so we can catch traceback messages.
    try:
        # We know this is a bad idea and will fail, so no warnings needed:
        # pylint: disable=import-outside-toplevel,import-error
        import unexisting_module
        unexisting_module.this_will_fail()
    except ModuleNotFoundError as expected_error:
        # Logging to console log and file log.
        logger.error("An expected error occured: %s", expected_error)

        # An exception will be redacted in the console log, but appears with
        # full traceback in the file log. Ideally use both statements for
        # full information.
        logger.exception("e %s", expected_error)

        # Here we can handle the error or `raise` it to pass it on.
        # Never raise exceptions in top-level scripts! This will generate
        # a traceback message that we then cannot redact.

    # Always catch remaining Exceptions in top-level scripts!
    # This way we can mask the traceback messages. Also, don't `raise` them,
    # or they will not be redacted.
    #
    # Catching Exception is very broad, so pylint would complain.
    # Disable this warning:
    # pylint: disable=broad-except
    except Exception as exception:
        logger.error("An unexpected error occured: %s", exception)
        logger.exception(exception)
    else:
        # Code in the else block is executed if no exceptions were raised.
        # Further exceptions from here on will be raised as usual.
        logger.info("Script would continue here if no exceptions were raised.")
        logger.info("You will never read this, because we forced exceptions.")

    logger.info("Script continues afterwards, if no exception was `raise`d.")


if __name__ == "__main__":
    main()
