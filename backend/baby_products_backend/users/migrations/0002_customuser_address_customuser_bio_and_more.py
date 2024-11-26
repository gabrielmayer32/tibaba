# Generated by Django 5.1.3 on 2024-11-25 10:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='address',
            field=models.TextField(blank=True, help_text='Optional address for deliveries or location-based searches', null=True, verbose_name='Address'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='bio',
            field=models.TextField(blank=True, help_text='A short bio about yourself', null=True, verbose_name='Bio'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='date_of_birth',
            field=models.DateField(blank=True, help_text='Optional date of birth for age verification or personalized experiences', null=True, verbose_name='Date of Birth'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='is_verified',
            field=models.BooleanField(default=False, help_text='Indicates if the user has been verified via email or phone', verbose_name='Verified User'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='phone_number',
            field=models.CharField(blank=True, help_text='Optional phone number for contact purposes', max_length=15, null=True, unique=True, verbose_name='Phone Number'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pictures/', verbose_name='Profile Picture'),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='email',
            field=models.EmailField(max_length=254, unique=True, verbose_name='Email Address'),
        ),
    ]
