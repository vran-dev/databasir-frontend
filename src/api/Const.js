export const databaseTypes = ['mysql', 'postgresql']

export const documentTemplatePropertiesKey = "document_template_properties"

export const appHost = process.env.VUE_APP_API_URL

export const innerDatabaseTypes = [
    {
      author: {},
      template: {
        databaseType: "mysql-8.0.28",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar",
        icon: require('@/assets/database/MySQL.svg'),
        description: "mysql-8.0.28",
        jdbcDriverClassName: "com.mysql.cj.jdbc.Driver",
        jdbcProtocol: "jdbc:mysql",
        urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}",
        isLocalUpload: false,
      }
    },
    {
      author: {},
      template: {
        databaseType: "mysql-5.1.49",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/mysql/mysql-connector-java/5.1.49/mysql-connector-java-5.1.49.jar",
        icon: require('@/assets/database/MySQL.svg'),
        description: "mysql-5.1.49",
        jdbcDriverClassName: "com.mysql.jdbc.Driver",
        jdbcProtocol: "jdbc:mysql",
        urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}",
        isLocalUpload: false,
      }
    },
    {
      author: {},
      template: {
        databaseType: "postgresql-42.3.4",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/org/postgresql/postgresql/42.3.4/postgresql-42.3.4.jar",
        icon: require('@/assets/database/PostgreSQL.svg'),
        description: "postgresql jdbc version 42.3.4",
        jdbcDriverClassName: "org.postgresql.Driver",
        jdbcProtocol: "jdbc:postgresql",
        urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}",
        isLocalUpload: false,
      }
    },
    {
      author: {},
      template: {
        databaseType: "mariadb-3.0.3",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/org/mariadb/jdbc/mariadb-java-client/3.0.3/mariadb-java-client-3.0.3.jar",
        icon: require('@/assets/database/MariaDB.svg'),
        description: "mariadb-3.0.3",
        jdbcDriverClassName: "org.mariadb.jdbc.Driver",
        jdbcProtocol: "jdbc:mariadb",
        urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}",
        isLocalUpload: false,
      }
    },
    {
      author: {},
      template: {
        databaseType: "oracle-thin-12.2.0.1",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/com/oracle/database/jdbc/ojdbc8/12.2.0.1/ojdbc8-12.2.0.1.jar",
        icon: require('@/assets/database/Oracle.svg'),
        description: "oracle-thin-12.2.0.1",
        jdbcDriverClassName: "oracle.jdbc.OracleDriver",
        jdbcProtocol: "jdbc:oracle:thin",
        urlPattern: "{{jdbc.protocol}}:@{{db.url}}:{{db.name}}",
        isLocalUpload: false,
      }
    },
    {
      author: {},
      template: {
        databaseType: "sqlServer-9.4.1.jre8",
        jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/com/microsoft/sqlserver/mssql-jdbc/9.4.1.jre8/mssql-jdbc-9.4.1.jre8.jar",
        icon: require('@/assets/database/Sqlserver.svg'),
        description: "sqlServer-9.4.1.jre8",
        jdbcDriverClassName: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
        jdbcProtocol: "jdbc:sqlserver",
        urlPattern: "{{jdbc.protocol}}://{{db.url}};databaseName={{db.name}}",
        isLocalUpload: false,
      }
    },
    // {
    //   author: {},
    //   template: {
    //     databaseType: "hive",
    //     jdbcDriverFileUrl: "https://maven.aliyun.com/repository/central/org/apache/hive/hive-jdbc/3.1.3/hive-jdbc-3.1.3-standalone.jar",
    //     icon: require('@/assets/database/Hive.svg'),
    //     description: "hive",
    //     jdbcDriverClassName: "org.apache.hive.jdbc.HiveDriver",
    //     jdbcProtocol: "jdbc:hive2",
    //     urlPattern: "{{jdbc.protocol}}://{{db.url}}/{{db.name}}",
    //     isLocalUpload: false,
    //   }
    // }
  ]