export const databaseTypes = ['mysql', 'postgresql']

export const documentTemplatePropertiesKey = "document_template_properties"

export const innerDatabaseTypes = [
    {
      author: {},
      template: {
        databaseType: "mysql-8.0.28",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar",
        icon: "/img/MySQL.c8f47618.svg",
        description: "mysql-8.0.28",
        jdbcDriverClassName: "com.mysql.cj.jdbc.Driver",
        jdbcProtocol: "jdbc:mysql",
        urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}"
      }
    },
    {
      author: {},
      template: {
        databaseType: "mysql-5.1.49",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/mysql/mysql-connector-java/5.1.49/mysql-connector-java-5.1.49.jar",
        icon: "/img/MySQL.c8f47618.svg",
        description: "mysql-5.1.49",
        jdbcDriverClassName: "com.mysql.jdbc.Driver",
        jdbcProtocol: "jdbc:mysql",
        urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}"
      }
    },
    {
      author: {},
      template: {
        databaseType: "postgresql-42.3.4",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/org/postgresql/postgresql/42.3.4/postgresql-42.3.4.jar",
        icon: "/img/PostgreSQL.6e3d3a5e.svg",
        description: "postgresql jdbc version 42.3.4",
        jdbcDriverClassName: "org.postgresql.Driver",
        jdbcProtocol: "jdbc:postgresql",
        urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}"
      }
    },
    {
      author: {},
      template: {
        databaseType: "mariadb-3.0.3",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/org/mariadb/jdbc/mariadb-java-client/3.0.3/mariadb-java-client-3.0.3.jar",
        icon: "/img/MariaDB.9e6854cc.svg",
        description: "mariadb-3.0.3",
        jdbcDriverClassName: "org.mariadb.jdbc.Driver",
        jdbcProtocol: "jdbc:mariadb",
        urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}"
      }
    },
    {
      author: {},
      template: {
        databaseType: "oracle-thin-12.2.0.1",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/com/oracle/database/jdbc/ojdbc8/12.2.0.1/ojdbc8-12.2.0.1.jar",
        icon: "/img/Oracle.c9ed26e0.svg",
        description: "oracle-thin-12.2.0.1",
        jdbcDriverClassName: "oracle.jdbc.OracleDriver",
        jdbcProtocol: "jdbc:oracle:thin",
        urlPattern: "{{jdbc.protocol}}:@{{db.url}}:{{db.name}}"
      }
    },
    {
      author: {},
      template: {
        databaseType: "sqlServer-9.4.1.jre8",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/com/microsoft/sqlserver/mssql-jdbc/9.4.1.jre8/mssql-jdbc-9.4.1.jre8.jar",
        icon: "/img/Sqlserver.deff7c4c.svg",
        description: "sqlServer-9.4.1.jre8",
        jdbcDriverClassName: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
        jdbcProtocol: "jdbc:sqlserver",
        urlPattern: "{{jdbc.protocol}}://{{db.url}};databaseName={{db.name}}"
      }
    }
  ]