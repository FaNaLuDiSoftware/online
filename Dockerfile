FROM php:8.2-apache

# Extensiones PHP que vas a usar
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Modulos de Apache
RUN a2enmod rewrite headers

# VirtualHost (sin heredoc, usando echo para que Docker lo procese bien)
RUN set -eux; \
  { \
    echo '<VirtualHost *:80>'; \
    echo '    DocumentRoot /var/www/html'; \
    echo '    <Directory /var/www/html>'; \
    echo '        AllowOverride All'; \
    echo '        Require all granted'; \
    echo '        Options -Indexes +FollowSymLinks'; \
    echo '    </Directory>'; \
    echo '    ErrorLog ${APACHE_LOG_DIR}/error.log'; \
    echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined'; \
    echo '</VirtualHost>'; \
  } > /etc/apache2/sites-available/000-default.conf
