# -*- coding: utf-8 -*-

"""Console script for DublinBikeApp."""
import sys
import click


@click.command()
def main(args=None):
    """Console script for DublinBikeApp."""
    click.echo("Replace this message by putting your code into "
               "DublinBikeApp.cli.main")
    click.echo("See click documentation at http://click.pocoo.org/")
    return 0


if __name__ == "__main__":
    main()
