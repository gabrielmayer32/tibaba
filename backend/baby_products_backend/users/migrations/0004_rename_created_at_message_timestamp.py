# Generated by Django 5.1.3 on 2024-11-26 05:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_message'),
    ]

    operations = [
        migrations.RenameField(
            model_name='message',
            old_name='created_at',
            new_name='timestamp',
        ),
    ]
